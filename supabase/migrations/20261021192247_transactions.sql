-- Movimientos (gastos e ingresos) y saldos calculados
alter table public.accounts add unique (id, user_id);
alter table public.categories add unique (id, user_id, kind);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  account_id uuid not null,
  category_id uuid not null,
  kind text not null check (kind in ('expense', 'income')),
  amount bigint not null check (amount > 0 and amount <= 1000000000000),
  date date not null,
  note text not null default '' check (length(note) <= 200),
  source text not null default 'manual' check (source in ('manual', 'chat', 'voice')),
  created_at timestamptz not null default now(),
  -- Las FK compuestas impiden cuentas/categorías de otro usuario y tipos que no coinciden.
  -- Sin "on delete": con movimientos, borrar la cuenta o la categoría se rechaza (restrict).
  foreign key (account_id, user_id) references public.accounts (id, user_id),
  foreign key (category_id, user_id, kind) references public.categories (id, user_id, kind)
);
create index transactions_user_date_idx on public.transactions (user_id, date desc);

alter table public.transactions enable row level security;
create policy "own rows" on public.transactions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- El saldo nunca se guarda: saldo inicial + ingresos - gastos
create view public.account_balances with (security_invoker = true) as
select a.id as account_id, a.user_id, a.currency,
       (a.initial_balance + coalesce(sum(case t.kind when 'income' then t.amount else -t.amount end), 0))::bigint as balance
from public.accounts a
left join public.transactions t on t.account_id = a.id
group by a.id;

revoke all on public.transactions, public.account_balances from anon, authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
grant select on public.account_balances to authenticated;

-- Los montos dependen de la moneda (decimales): no se puede cambiar la moneda de una cuenta con movimientos
create function public.prevent_currency_change() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.currency <> old.currency and exists (select 1 from public.transactions where account_id = old.id) then
    raise exception 'currency_locked';
  end if;
  return new;
end $$;

create trigger accounts_currency_locked
  before update of currency on public.accounts
  for each row execute function public.prevent_currency_change();
