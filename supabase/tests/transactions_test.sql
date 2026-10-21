begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'ana@test.com', '{"name":"Ana"}'),
  ('22222222-2222-2222-2222-222222222222', 'beto@test.com', '{"name":"Beto"}');

-- Beto hace su onboarding y guardamos su cuenta
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select public.complete_onboarding('COP', 'Efectivo', 'cash', 0);
select set_config('t.beto_acc', (select id::text from public.accounts limit 1), true);

-- Ana hace su onboarding y guardamos sus ids
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select public.complete_onboarding('COP', 'Efectivo', 'cash', 150000);
select set_config('t.ana_acc', (select id::text from public.accounts limit 1), true);
select set_config('t.inc_cat', (select id::text from public.categories where kind = 'income' limit 1), true);
select set_config('t.exp_cat', (select id::text from public.categories where kind = 'expense' limit 1), true);

select lives_ok(
  $$ insert into public.transactions (account_id, category_id, kind, amount, date)
     values (current_setting('t.ana_acc')::uuid, current_setting('t.inc_cat')::uuid, 'income', 1000, '2026-10-01') $$,
  'Ana registra un ingreso con categoría de ingreso');
select throws_ok(
  $$ insert into public.transactions (account_id, category_id, kind, amount, date)
     values (current_setting('t.ana_acc')::uuid, current_setting('t.inc_cat')::uuid, 'expense', 400, '2026-10-01') $$,
  '23503', null, 'un gasto no puede usar una categoría de ingreso');
select throws_ok(
  $$ insert into public.transactions (account_id, category_id, kind, amount, date)
     values (current_setting('t.ana_acc')::uuid, current_setting('t.exp_cat')::uuid, 'expense', 0, '2026-10-01') $$,
  '23514', null, 'el monto 0 se rechaza');
select throws_ok(
  $$ insert into public.transactions (account_id, category_id, kind, amount, date)
     values (current_setting('t.ana_acc')::uuid, current_setting('t.exp_cat')::uuid, 'expense', 1000000000001, '2026-10-01') $$,
  '23514', null, 'un monto absurdo se rechaza');
select throws_ok(
  $$ insert into public.transactions (account_id, category_id, kind, amount, date)
     values (current_setting('t.beto_acc')::uuid, current_setting('t.exp_cat')::uuid, 'expense', 400, '2026-10-01') $$,
  '23503', null, 'Ana no puede usar la cuenta de Beto');

insert into public.transactions (account_id, category_id, kind, amount, date)
  values (current_setting('t.ana_acc')::uuid, current_setting('t.exp_cat')::uuid, 'expense', 400, '2026-10-02');
select is(
  (select balance from public.account_balances where account_id = current_setting('t.ana_acc')::uuid),
  150600::bigint, 'el saldo es inicial + ingresos - gastos');
select throws_ok(
  $$ delete from public.accounts where id = current_setting('t.ana_acc')::uuid $$,
  '23503', null, 'no se puede borrar una cuenta con movimientos');
select throws_ok(
  $$ update public.accounts set currency = 'USD' where id = current_setting('t.ana_acc')::uuid $$,
  'P0001', 'currency_locked', 'no se puede cambiar la moneda de una cuenta con movimientos');
select lives_ok(
  $$ update public.accounts set name = 'Billetera' where id = current_setting('t.ana_acc')::uuid $$,
  'sí se puede renombrar una cuenta con movimientos');

-- Actuar como Beto
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select is((select count(*)::int from public.transactions), 0, 'Beto no ve los movimientos de Ana');
select is((select count(*)::int from public.account_balances), 1, 'Beto solo ve el saldo de su cuenta');

-- Sin sesión
set local role anon;
select throws_ok($$ select * from public.transactions $$, '42501', null, 'anon no puede leer movimientos');

select * from finish();
rollback;
