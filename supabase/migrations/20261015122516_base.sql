-- Perfiles: una fila por usuario, creada automáticamente al registrarse
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  main_currency text check (main_currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 40),
  type text not null check (type in ('cash', 'bank', 'card')),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  initial_balance bigint not null default 0,
  created_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 40),
  allocation_type text not null check (allocation_type in ('percent', 'amount')),
  allocation_value bigint not null check (allocation_value >= 0),
  is_fixed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  check (allocation_type <> 'percent' or allocation_value <= 100)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 40),
  kind text not null check (kind in ('expense', 'income')),
  group_id uuid,
  emoji text not null check (length(btrim(emoji)) between 1 and 16),
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  -- La FK compuesta impide usar un grupo de otro usuario
  foreign key (group_id, user_id) references public.groups (id, user_id) on delete set null (group_id),
  check (kind = 'expense' or group_id is null)
);

-- Seguridad por fila
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.groups enable row level security;
alter table public.categories enable row level security;

create policy "own profile select" on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own rows" on public.accounts for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.groups for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.categories for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.accounts, public.groups, public.categories to authenticated;

-- Primer uso: todo o nada, y solo una vez
create function public.complete_onboarding(
  p_main_currency text,
  p_account_name text,
  p_account_type text,
  p_initial_balance bigint
) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  v_current text;
  v_fijos uuid;
  v_variables uuid;
  v_ahorro uuid;
begin
  -- FOR UPDATE serializa dos llamadas simultáneas (doble toque)
  select main_currency into v_current from public.profiles
    where id = (select auth.uid()) for update;
  if not found then raise exception 'profile_not_found'; end if;
  if v_current is not null then raise exception 'already_onboarded'; end if;

  update public.profiles set main_currency = p_main_currency where id = (select auth.uid());

  insert into public.accounts (name, type, currency, initial_balance)
  values (p_account_name, p_account_type, p_main_currency, p_initial_balance);

  insert into public.groups (name, allocation_type, allocation_value, is_fixed)
    values ('Fijos', 'percent', 50, true) returning id into v_fijos;
  insert into public.groups (name, allocation_type, allocation_value, is_fixed)
    values ('Variables', 'percent', 30, false) returning id into v_variables;
  insert into public.groups (name, allocation_type, allocation_value, is_fixed)
    values ('Ahorro', 'percent', 20, false) returning id into v_ahorro;

  insert into public.categories (name, kind, group_id, emoji, color) values
    ('Arriendo', 'expense', v_fijos, '🏠', '#AF52DE'),
    ('Servicios', 'expense', v_fijos, '💡', '#FFCC00'),
    ('Mercado', 'expense', v_fijos, '🛒', '#34C759'),
    ('Celular e internet', 'expense', v_fijos, '📱', '#5856D6'),
    ('Comida', 'expense', v_variables, '🍔', '#FF9500'),
    ('Transporte', 'expense', v_variables, '🚗', '#007AFF'),
    ('Ocio', 'expense', v_variables, '🎉', '#FF2D55'),
    ('Compras', 'expense', v_variables, '🛍️', '#32ADE6'),
    ('Salud', 'expense', v_variables, '💊', '#FF3B30'),
    ('Ahorro', 'expense', v_ahorro, '🐷', '#00C7BE'),
    ('Salario', 'income', null, '💰', '#34C759'),
    ('Ingreso extra', 'income', null, '✨', '#FFCC00');
end $$;

revoke execute on function public.complete_onboarding(text, text, text, bigint) from public, anon;
grant execute on function public.complete_onboarding(text, text, text, bigint) to authenticated;
