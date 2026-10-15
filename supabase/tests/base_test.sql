begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.com', '{"name":"Ana"}'),
  ('22222222-2222-2222-2222-222222222222', 'beto@test.com', '{}');

select is(
  (select name from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'Ana', 'el trigger crea el perfil con el nombre');

-- Actuar como Ana
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select lives_ok(
  $$ select public.complete_onboarding('COP', 'Efectivo', 'cash', 150000) $$,
  'Ana completa el onboarding');
select is((select count(*)::int from public.groups), 3, 'crea 3 grupos');
select is((select count(*)::int from public.categories), 12, 'crea 12 categorías');
select is((select main_currency from public.profiles), 'COP', 'guarda la moneda principal');
select throws_ok(
  $$ select public.complete_onboarding('COP', 'Efectivo', 'cash', 0) $$,
  'P0001', 'already_onboarded', 'no se puede repetir el onboarding');
select throws_ok(
  $$ insert into public.groups (name, allocation_type, allocation_value) values ('X', 'percent', 101) $$,
  '23514', null, 'un porcentaje mayor a 100 falla');

-- Guardar el id de un grupo de Ana para intentar usarlo como Beto
reset role;
select set_config('test.ana_group',
  (select id::text from public.groups where user_id = '11111111-1111-1111-1111-111111111111' limit 1),
  true);

-- Actuar como Beto
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select is((select count(*)::int from public.accounts), 0, 'Beto no ve las cuentas de Ana');
select is((select count(*)::int from public.profiles), 1, 'Beto solo ve su propio perfil');
select throws_ok(
  $$ insert into public.accounts (user_id, name, type, currency)
     values ('11111111-1111-1111-1111-111111111111', 'Robo', 'cash', 'COP') $$,
  '42501', null, 'Beto no puede crear cuentas a nombre de Ana');
select throws_ok(
  $$ insert into public.categories (name, kind, group_id, emoji, color)
     values ('X', 'expense', current_setting('test.ana_group')::uuid, '🍔', '#FF9500') $$,
  '23503', null, 'Beto no puede usar un grupo de Ana');

select * from finish();
rollback;
