# MoneyApp Fase 2 (Movimientos) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Registrar gastos e ingresos a mano, verlos en una lista con el emoji y color de su categoría, y ver en Inicio el saldo, los ingresos vs. gastos del mes y los gastos por categoría separados en fijos y variables.

**Architecture:** Una tabla `transactions` con claves foráneas compuestas (el usuario, el tipo y la cuenta/categoría deben coincidir) y una vista `account_balances` que calcula el saldo (el saldo nunca se guarda). La lógica de fechas y resúmenes vive en funciones puras probadas (`src/domain`); las pantallas solo las pintan. El formulario es una hoja inferior nativa (`presentation: 'formSheet'` de Expo Router).

**Tech Stack:** Expo SDK 57, Expo Router, Supabase (Postgres + RLS + pgTAP), Jest, `react-native-reanimated` (ya instalado), `@react-native-community/datetimepicker`, `expo-haptics`.

**Spec:** `docs/superpowers/specs/2026-10-14-moneyapp-design.md` (secciones 3, 4.1, 4.3, 7, 8, 10 fase 2). Fase anterior: `docs/superpowers/plans/2026-10-14-fase-1-base.md` (ya integrada en `develop`).

## Global Constraints

- Toda la interfaz en **español**.
- Montos como **enteros en la unidad mínima** de la moneda; el saldo de una cuenta no se guarda: `initial_balance + Σ movimientos`.
- **RLS activado en todas las tablas**; cada usuario solo ve y modifica sus filas.
- Un gasto es "fijo" o "variable" según el `is_fixed` de su grupo.
- Estilo Apple **idéntico en iOS y Android** (sin Material Design); modo claro y oscuro; tarjetas con radio 16; fuente del sistema en iOS e Inter en Android.
- **Emojis** como íconos de categorías; íconos de navegación y controles en vector (SF Symbols / Ionicons).
- Animaciones con resorte/suaves, háptica al confirmar, bottom sheets para registrar y editar.
- Sin internet: aviso y guardar deshabilitado (mensaje "Sin conexión. Revisa tu internet e intenta de nuevo").
- Monedas soportadas: COP, USD, EUR, MXN. Las tasas de cambio llegan en la fase 6.
- Todo el trabajo en la rama `feature/fase-2-movimientos`, creada desde `develop`.

## Diseño de esta fase (resultado de aplicar ui-ux-pro-max)

La búsqueda `--design-system` devolvió una recomendación para landing pages web (glassmorphism, tipografía manuscrita Caveat/Quicksand). **No encaja** con una app móvil minimalista al estilo Apple y no se aplica ni se guarda. Sí se aplican sus reglas de calidad para apps (checklist "Pre-Delivery"):

| Regla | Decisión para MoneyApp |
|---|---|
| Contraste de texto ≥ 4.5:1 en claro **y** oscuro | Se oscurecen los tokens claros de acento, verde, rojo y texto secundario (Task 1); lo comprueba una prueba automática |
| Color no es el único indicador | Ingresos llevan `+` y gastos `−` además del color; "Excedido" (fase 3) llevará texto |
| Toques ≥ 44pt, ritmo 4/8 | Botones de mes, FAB (56pt) y filas ≥ 44pt; espacios 8/16/24 |
| Presionar no mueve el layout | Solo cambia opacidad/fondo al presionar |
| Safe areas y contenido tras barras | `Screen` ya reserva espacio; el FAB se coloca sobre la barra de pestañas |
| Animar con transform/opacity, respetar "reducir movimiento" | Barras con `scaleX`; contador y barras se saltan la animación si el sistema pide reducir movimiento |
| Gestos con alternativa | Nada es solo-deslizar: borrar está en el formulario de edición |
| Teclado adecuado, etiquetas visibles | `numbers-and-punctuation` para montos; todos los campos con etiqueta |
| Emojis no como íconos **estructurales** | Se mantienen emojis solo como contenido de categoría (pedido del usuario); navegación y FAB usan íconos vectoriales |

**Desvío del spec:** la sección 2 lista `@gorhom/bottom-sheet`. Se usa en su lugar la hoja nativa de Expo Router (`formSheet`): cero dependencias nuevas, se ve como las hojas de iOS y AGENTS.md pide preferir módulos de Expo. En Android `formSheet` cae a modal a pantalla casi completa.

**Fuera de alcance (fases siguientes):** presupuestos y la barra "excedido" (fase 3), filtros por cuenta y categoría en Movimientos (fase 3), transferencias y metas (fase 3), conversión de monedas (fase 6). En esta fase las cuentas en otra moneda **no** se suman al saldo total; Inicio avisa cuáles quedaron fuera.

## Review Focus

1. Un movimiento del 31 de octubre y otro del 1 de noviembre caen en meses distintos sin importar la zona horaria → prueba de `monthRange` con cadenas de fecha (Task 3).
2. Monto vacío, 0, negativo o absurdamente grande (> 10¹²) se rechaza con mensaje claro → `validateAmount` (Task 3) y `check` en la tabla (Task 2).
3. Un gasto con categoría de ingreso (o al revés), o con la cuenta/categoría de otro usuario, lo rechaza la base de datos → pgTAP (Task 2).
4. Eliminar una cuenta o categoría que tiene movimientos muestra un mensaje en español, no "Algo salió mal" → prueba de `errorMessage` (Task 3) y `restrict` en la base (Task 2).
5. Una cuenta en otra moneda no se suma en silencio al saldo en la moneda principal → `splitBalances` (Task 3) y aviso en Inicio (Task 8).
6. Usuario sin movimientos: Inicio y Movimientos muestran un estado vacío amable, sin `NaN` ni pantalla en blanco → prueba de resumen vacío (Task 3) y `EmptyState` (Tasks 5, 7, 8).

---

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/theme/colors.ts` | Tokens claro/oscuro accesibles (exporta `lightColors`, `darkColors`) |
| `supabase/migrations/*_transactions.sql` | Tabla `transactions`, vista `account_balances`, RLS y permisos |
| `supabase/tests/transactions_test.sql` | pgTAP de integridad y RLS |
| `src/domain/dates.ts` | Mes/fechas en texto `YYYY-MM-DD` sin zonas horarias |
| `src/domain/ledger.ts` | Resumen del mes, saldos por moneda, agrupar por día |
| `src/domain/validation.ts` | `validateAmount` (se agrega) |
| `src/domain/errors.ts` | Mensaje `in_use` (se agrega) |
| `src/data/transactions.ts`, `src/data/ledger.ts` | Consultas a Supabase |
| `src/ui/CategoryBadge.tsx`, `ProgressBar.tsx`, `MovementRow.tsx`, `EmptyState.tsx`, `Fab.tsx`, `CategoryPicker.tsx`, `useCountUp.ts` | Componentes visuales |
| `src/app/movimiento.tsx` | Hoja de registrar/editar movimiento |
| `src/app/(tabs)/movimientos.tsx`, `src/app/(tabs)/index.tsx` | Pantallas Movimientos e Inicio |

---

### Task 1: Tokens de color accesibles

**Files:**
- Modify: `src/theme/colors.ts`
- Test: `src/theme/__tests__/contrast.test.ts`

**Interfaces:**
- Produces: `lightColors`, `darkColors` (exports nombrados, mismas claves que hoy más `onAccent: string`); `type Colors`; `useTheme(): Colors` sin cambios.

- [ ] **Step 1: Crear la rama.** `git checkout develop && git checkout -b feature/fase-2-movimientos`
- [ ] **Step 2: Escribir la prueba que falla** en `src/theme/__tests__/contrast.test.ts`. Incluye una función `contrast(hexA, hexB): number` con la fórmula WCAG (luminancia relativa con linealización sRGB; razón `(L1+0.05)/(L2+0.05)`). Un `describe.each([['claro', lightColors], ['oscuro', darkColors]])` con estos casos, todos `>= 4.5`:
  - `text`, `secondary`, `accent`, `green`, `red` sobre `card` y sobre `background`.
  - `onAccent` sobre `accent`.
- [ ] **Step 3: Correr** `npm test -- contrast`. Expected: FAIL (no existen los exports y, una vez exportados, fallan `secondary`, `accent`, `green` y `red` claros).
- [ ] **Step 4: Modificar `colors.ts`:** exportar `lightColors` y `darkColors`, agregar `onAccent: '#FFFFFF'` en ambos, y oscurecer en el tema claro solo los tokens que fallen. Punto de partida (mismo tono, más oscuro): `secondary '#6C6C70'`, `accent '#0066D6'`, `green '#1F7A36'`, `red '#D70015'`. Si algún par sigue bajo 4.5, ajustar ese token hasta que pase. El tema oscuro conserva sus valores salvo que la prueba exija otra cosa.
- [ ] **Step 5: Correr** `npm test`. Expected: PASS (todas, incluidas las 25 anteriores) y `npx tsc --noEmit` sin errores.
- [ ] **Step 6: Commit.** `git commit -m "feat: tokens de color con contraste WCAG AA"`

---

### Task 2: Tabla `transactions`, vista de saldos y pruebas pgTAP

**Files:**
- Create: `supabase/migrations/<timestamp>_transactions.sql` (generar con `npx supabase migration new transactions`)
- Test: `supabase/tests/transactions_test.sql`
- Modify: `src/lib/database.types.ts` (regenerar)

**Interfaces:**
- Produces:
  - Tabla `transactions(id, user_id, account_id, category_id, kind 'expense'|'income', amount bigint, date date, note text, source text, created_at)`
  - Vista `account_balances(account_id, user_id, currency, balance bigint)`
  - Tipos `Tables<'transactions'>`, `TablesInsert<'transactions'>`, y `Views.account_balances` en `@/lib/database.types`

- [ ] **Step 1: Escribir la prueba pgTAP que falla** en `supabase/tests/transactions_test.sql` (mismo estilo que `base_test.sql`: `begin; … select plan(N); … rollback;`, dos usuarios Ana y Beto insertados en `auth.users`, Ana y Beto ejecutan `complete_onboarding('COP','Efectivo','cash', 150000)` con `set local request.jwt.claims`; los ids de cuenta y categorías se guardan con `set_config('t.xxx', …, true)` como en la prueba existente). Casos, con el código de error esperado:
  1. Ana inserta un ingreso con una categoría de ingreso → `lives_ok`.
  2. Ana inserta un gasto con una categoría de ingreso → `throws_ok` `23503`.
  3. Ana inserta un movimiento con `amount = 0` → `throws_ok` `23514`.
  4. Ana inserta un movimiento con `amount = 1000000000001` → `throws_ok` `23514`.
  5. Ana inserta un movimiento usando la cuenta de Beto → `throws_ok` `23503`.
  6. `account_balances` de Ana: con saldo inicial 150000, un ingreso de 1000 y un gasto de 400 → `balance = 150600`.
  7. Ana elimina su cuenta con movimientos → `throws_ok` `23503`.
  8. Como Beto: `select count(*) from transactions` = 0 y `select count(*) from account_balances` = 1 (solo la suya).
  9. Como `anon`: `select * from transactions` → `throws_ok` `42501`.
- [ ] **Step 2: Correr** `npx supabase test db`. Expected: FAIL (`relation "public.transactions" does not exist`).
- [ ] **Step 3: Escribir la migración** con exactamente estas decisiones:

```sql
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

create view public.account_balances with (security_invoker = true) as
select a.id as account_id, a.user_id, a.currency,
       (a.initial_balance + coalesce(sum(case t.kind when 'income' then t.amount else -t.amount end), 0))::bigint as balance
from public.accounts a
left join public.transactions t on t.account_id = a.id
group by a.id;

revoke all on public.transactions, public.account_balances from anon, authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
grant select on public.account_balances to authenticated;
```

- [ ] **Step 4: Aplicar y correr** `npx supabase db reset && npx supabase test db`. Expected: `Result: PASS` (las 14 pruebas anteriores más las nuevas; ajustar el `plan(N)` al total).
- [ ] **Step 5: Regenerar tipos:** `npx supabase gen types typescript --local > src/lib/database.types.ts`. Expected: el archivo contiene `transactions` y `account_balances`; `npx tsc --noEmit` sin errores.
- [ ] **Step 6: Commit.** `git commit -m "feat: tabla de movimientos y vista de saldos con RLS"`

---

### Task 3: Lógica pura de fechas, resúmenes, monto y errores

**Files:**
- Create: `src/domain/dates.ts`, `src/domain/ledger.ts`
- Modify: `src/domain/validation.ts`, `src/domain/errors.ts`
- Test: `src/domain/__tests__/dates.test.ts`, `src/domain/__tests__/ledger.test.ts`; agregar casos a `validation.test.ts` y `errors.test.ts`

**Interfaces:**
- Produces (`dates.ts`):
  - `type YearMonth = { year: number; month: number }` (`month` 0–11)
  - `toDateString(d: Date): string` → `'YYYY-MM-DD'` con la fecha **local**
  - `currentYearMonth(now?: Date): YearMonth`
  - `shiftMonth(ym: YearMonth, delta: number): YearMonth`
  - `monthRange(ym: YearMonth): { from: string; to: string }` (`from` inclusivo, `to` exclusivo: primer día del mes siguiente)
  - `monthLabel(ym: YearMonth): string` → `'Octubre de 2026'` (nombres de mes en una tabla fija, sin `Intl`)
  - `formatDayLabel(date: string, today?: Date): string` → `'Hoy'`, `'Ayer'`, `'3 oct'`, y `'3 oct 2025'` si es de otro año
- Produces (`ledger.ts`):
  - `type MovementLite = { kind: 'expense' | 'income'; amount: number; category_id: string; date: string }`
  - `type CategoryLite = { id: string; group_id: string | null }`, `type GroupLite = { id: string; is_fixed: boolean }`
  - `type MonthSummary = { income: number; expense: number; fixedExpense: number; variableExpense: number; byCategory: { categoryId: string; total: number; share: number; fixed: boolean }[] }`
  - `summarizeMonth(movements: MovementLite[], categories: CategoryLite[], groups: GroupLite[]): MonthSummary` — `byCategory` solo gastos, ordenado de mayor a menor; `share = total / expense` (0 si no hay gastos); una categoría sin grupo cuenta como **variable**
  - `splitBalances(accounts: { currency: string; balance: number }[], main: string): { total: number; otherCurrencies: string[] }` (monedas únicas y ordenadas)
  - `inCurrency<T extends { account_id: string }>(items: T[], accounts: { id: string; currency: string }[], currency: string): T[]`
  - `groupByDay<T extends { date: string }>(items: T[]): { date: string; items: T[] }[]` (días de más reciente a más antiguo; conserva el orden de los ítems)
- Produces: `validateAmount(minor: number | null): string | null` y el mensaje de `errorMessage(new Error('in_use'))`.

- [ ] **Step 1: Escribir las pruebas que fallan.**
  - `dates.test.ts`: `toDateString(new Date(2026, 9, 5))` = `'2026-10-05'`; `shiftMonth({year:2026,month:11}, 1)` = `{year:2027,month:0}` y `shiftMonth({year:2026,month:0}, -1)` = `{year:2025,month:11}`; `monthRange({year:2026,month:11})` = `{from:'2026-12-01', to:'2027-01-01'}`; `monthRange({year:2024,month:1})` = `{from:'2024-02-01', to:'2024-03-01'}`; **frontera del mes (Review Focus 1):** con `monthRange` de octubre 2026, `'2026-10-31' >= from && '2026-10-31' < to` y `'2026-11-01' >= to`; `currentYearMonth(new Date(2026, 9, 31, 23, 59))` = `{year:2026,month:9}`; `monthLabel({year:2026,month:9})` = `'Octubre de 2026'`; `formatDayLabel` con `today = new Date(2026, 9, 15)`: `'2026-10-15'`→`'Hoy'`, `'2026-10-14'`→`'Ayer'`, `'2026-10-03'`→`'3 oct'`, `'2025-10-03'`→`'3 oct 2025'`.
  - `ledger.test.ts`: (a) con 2 categorías en grupo fijo, 1 en grupo variable y 1 sin grupo, gastos e ingresos mezclados → `income`, `expense`, `fixedExpense`, `variableExpense` correctos, `byCategory` ordenado, `share` suma 1 y la categoría sin grupo cuenta como variable; (b) **vacío (Review Focus 6):** `summarizeMonth([], [], [])` = todo en 0, `byCategory` `[]`, sin `NaN`; (c) solo ingresos → `expense = 0`, `byCategory` `[]`; (d) `splitBalances([{currency:'COP',balance:100},{currency:'USD',balance:5},{currency:'USD',balance:7},{currency:'EUR',balance:1}], 'COP')` = `{total:100, otherCurrencies:['EUR','USD']}` **(Review Focus 5)**; (e) `inCurrency` deja solo los ítems de cuentas en la moneda pedida; (f) `groupByDay` agrupa y ordena días descendente.
  - `validation.test.ts` (agregar `describe('validateAmount')`): `null`→`'Escribe un monto válido'`; `0` y `-5`→`'El monto debe ser mayor a 0'`; `10**12 + 1`→`'El monto es demasiado grande'`; `25000` y `10**12`→`null`.
  - `errors.test.ts` (agregar): `errorMessage(new Error('in_use'))` = `'No se puede eliminar porque tiene movimientos. Cambia o elimina esos movimientos primero'`.
- [ ] **Step 2: Correr** `npm test`. Expected: FAIL (módulos y funciones inexistentes).
- [ ] **Step 3: Implementar** `dates.ts` y `ledger.ts` con las firmas de Interfaces (solo cadenas de fecha y aritmética de enteros; ninguna función usa `Date` salvo `toDateString`, `currentYearMonth` y `formatDayLabel`), agregar `validateAmount` a `validation.ts` y la entrada `in_use` a `errors.ts` (se detecta con `msg.includes('in_use')`, igual que `already_onboarded`).
- [ ] **Step 4: Correr** `npm test`. Expected: PASS todas.
- [ ] **Step 5: Commit.** `git commit -m "feat: lógica de fechas, resumen mensual y validación de monto"`

---

### Task 4: Capa de datos y dependencias

**Files:**
- Create: `src/data/transactions.ts`, `src/data/ledger.ts`
- Modify: `src/data/accounts.ts`, `src/data/categories.ts`, `package.json`

**Interfaces:**
- Consumes: `Tables`, `TablesInsert` de `@/lib/database.types` (Task 2); `Account`, `listAccounts` (`@/data/accounts`); `Category`, `listCategories`; `Group`, `listGroups`.
- Produces (`transactions.ts`):
  - `type Transaction = Tables<'transactions'>`; `type TransactionInput = Pick<TablesInsert<'transactions'>, 'account_id' | 'category_id' | 'kind' | 'amount' | 'date' | 'note'>`
  - `listTransactions(range: { from: string; to: string }): Promise<Transaction[]>` — `date >= from` y `date < to`, orden `date` desc y `created_at` desc
  - `getTransaction(id: string): Promise<Transaction>`
  - `saveTransaction(input: TransactionInput, id?: string): Promise<void>` (inserta o actualiza)
  - `deleteTransaction(id: string): Promise<void>`
  - `type Balance = { account_id: string; currency: string; balance: number }`; `listBalances(): Promise<Balance[]>` (lee `account_balances`)
- Produces (`ledger.ts`): `type MonthData = { transactions: Transaction[]; categories: Category[]; groups: Group[]; accounts: Account[]; balances: Balance[] }`; `loadMonth(range: { from: string; to: string }): Promise<MonthData>` (todo en paralelo con `Promise.all`).
- `deleteAccount` y `deleteCategory` lanzan `new Error('in_use')` cuando Postgres responde el código `23503`.

- [ ] **Step 1: Instalar el selector de fecha:** `npx expo install @react-native-community/datetimepicker`. Expected: queda en `package.json` con la versión de SDK 57.
- [ ] **Step 2: Implementar** `transactions.ts` y `ledger.ts` siguiendo el patrón de `src/data/accounts.ts` (lanzar el `error` de Supabase tal cual).
- [ ] **Step 3: Modificar** `deleteAccount` y `deleteCategory`: si `error?.code === '23503'`, `throw new Error('in_use')`; cualquier otro error se relanza igual.
- [ ] **Step 4: Verificar:** `npx tsc --noEmit && npm test`. Expected: sin errores; todas las pruebas en PASS.
- [ ] **Step 5: Commit.** `git commit -m "feat: capa de datos de movimientos y saldos"`

---

### Task 5: Componentes visuales

**Files:**
- Create: `src/ui/CategoryBadge.tsx`, `src/ui/ProgressBar.tsx`, `src/ui/MovementRow.tsx`, `src/ui/EmptyState.tsx`, `src/ui/Fab.tsx`, `src/ui/CategoryPicker.tsx`, `src/ui/useCountUp.ts`

**Interfaces:**
- Consumes: `useTheme`, `AppText`, `formatMoney`/`CurrencyCode`, `Transaction`, `Category`, `Account`.
- Produces:
  - `<CategoryBadge emoji: string color: string size?: number />` — círculo (por defecto 40) con el color de la categoría al 20 % de opacidad y el emoji centrado; oculto para lectores de pantalla (el nombre va en el texto de al lado).
  - `<ProgressBar value: number /* 0..1 */ color: string height?: number />` — pista `c.fill` y relleno que se anima con `scaleX` (`transformOrigin: 'left'`, `withTiming` ~500 ms, curva `Easing.out(Easing.cubic)`); con `useReducedMotion()` de Reanimated el valor se aplica sin animar; `accessibilityRole="progressbar"` con `accessibilityValue`.
  - `<MovementRow transaction: Transaction category?: Category account?: Account onPress: () => void />` — `CategoryBadge`, título `note || category.name`, subtítulo `"{categoría} · {cuenta}"`, monto a la derecha: ingreso `+{formatMoney}` en `c.green`, gasto `-{formatMoney}` en `c.text`; alto mínimo 56; `accessibilityLabel` completo (p. ej. "Gasto de $ 25.000 en Comida, cuenta Efectivo").
  - `<EmptyState emoji: string title: string message: string actionLabel?: string onAction?: () => void />`
  - `<Fab label: string onPress: () => void />` — círculo de 56 con ícono `add` (Ionicons) blanco sobre `c.accent`, posición absoluta a la derecha, por encima de la barra de pestañas (`bottom: insets.bottom + 49 + 16`; anotar con `// ponytail: alto fijo de la barra de pestañas`); háptica ligera; `accessibilityLabel={label}`.
  - `<CategoryPicker categories: Category[] value: string | null onChange: (id: string) => void />` — rejilla que envuelve de `CategoryBadge` con el nombre debajo; la elegida lleva un borde de 2 px `c.accent`; cada ítem ≥ 64 de ancho y alto táctil.
  - `useCountUp(target: number, durationMs?: number): number` — interpola del valor mostrado actual al nuevo con `requestAnimationFrame` y curva `easeOutCubic`; si `AccessibilityInfo.isReduceMotionEnabled()` es `true`, devuelve `target` de inmediato; cancela el frame al desmontar.
- Presionar solo cambia opacidad o fondo (nunca tamaño ni posición).

- [ ] **Step 1: Implementar los siete archivos** con las firmas de arriba, usando solo tokens de `useTheme()` (sin colores sueltos salvo el blanco sobre acento).
- [ ] **Step 2: Verificar:** `npx tsc --noEmit`. Expected: sin errores.
- [ ] **Step 3: Comprobar que compila:** `npx expo export --platform android --output-dir <carpeta temporal fuera del repo>`; borrar la carpeta. Expected: `Exported`.
- [ ] **Step 4: Commit.** `git commit -m "feat: componentes visuales de movimientos"`

---

### Task 6: Hoja de registrar y editar movimiento

**Files:**
- Create: `src/app/movimiento.tsx`
- Modify: `src/app/_layout.tsx` (registrar la ruta dentro del `Stack.Protected` de `status === 'ready'`)

**Interfaces:**
- Consumes: `saveTransaction`, `getTransaction`, `deleteTransaction`, `Transaction` (Task 4); `listAccounts`, `listCategories`; `parseAmount`, `amountToInput`, `CurrencyCode`; `validateAmount`, `errorMessage`; `toDateString`; `CategoryPicker`, `EmptyState`, `Button`, `ChoiceChips`, `TextField`, `Screen`.
- Produces: ruta `/movimiento` (nuevo) y `/movimiento?id=<uuid>` (editar), con parámetro opcional `kind=expense|income`.

- [ ] **Step 1: Registrar la ruta** en `_layout.tsx`: `<Stack.Screen name="movimiento" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.92], sheetGrabberVisible: true, sheetCornerRadius: 24, headerShown: false }} />` dentro del `Stack.Protected` de `ready`.
- [ ] **Step 2: Implementar `movimiento.tsx`** con este comportamiento:
  - Selector de tipo arriba (`ChoiceChips`: `'💸 Gasto'` / `'💰 Ingreso'`); por defecto el de `kind` o gasto. Al cambiar el tipo se limpia la categoría elegida.
  - **Monto** grande y centrado (`fontSize` 44, con la moneda de la cuenta elegida al lado), `keyboardType="numbers-and-punctuation"`, `autoFocus` solo al crear, etiqueta visible "Monto".
  - `CategoryPicker` con las categorías del tipo elegido; **cuentas** con `ChoiceChips` (nombre de la cuenta); por defecto la primera cuenta.
  - **Fecha:** fila "Fecha" que muestra `formatDayLabel`; en iOS un `DateTimePicker` (`mode="date"`, `display="compact"`); en Android se abre al tocar la fila. Por defecto hoy.
  - **Nota** opcional (`TextField`, máx. 200).
  - Botón "Guardar" (`loading` mientras guarda; deshabilitado y con el mensaje "Sin conexión…" si falla por red). Al guardar: validar con `parseAmount` + `validateAmount`, exigir categoría, `saveTransaction`, háptica de éxito, `router.back()`. Errores inline bajo cada campo; errores de red/servidor en un `Alert`.
  - Al editar: precargar con `getTransaction` (`amountToInput`) y mostrar "Eliminar movimiento" (confirmación con `Alert`, luego `deleteTransaction` y `router.back()`).
  - Sin cuentas, o sin categorías del tipo elegido: `EmptyState` con acción que lleva a `/ajustes/cuentas` o `/ajustes/categorias`.
- [ ] **Step 3: Verificar:** `npx tsc --noEmit && npm test`, y que `npx expo export --platform android` (carpeta temporal) termine con `Exported`.
- [ ] **Step 4: Commit.** `git commit -m "feat: hoja para registrar y editar movimientos"`

---

### Task 7: Pantalla Movimientos

**Files:**
- Modify: `src/app/(tabs)/movimientos.tsx` (reemplazar)

**Interfaces:**
- Consumes: `loadMonth`, `MonthData` (Task 4); `useFocusQuery`; `currentYearMonth`, `shiftMonth`, `monthRange`, `monthLabel`, `formatDayLabel`; `groupByDay`, `summarizeMonth`, `inCurrency`; `MovementRow`, `EmptyState`, `Fab`, `Screen`, `Section`, `ChoiceChips`; `useAuth` (moneda principal).

- [ ] **Step 1: Implementar la pantalla** (`Screen` con título "Movimientos"):
  - **Selector de mes:** `‹ Octubre de 2026 ›` con dos botones de 44×44 (íconos vectoriales `chevron-back`/`chevron-forward`, con `accessibilityLabel` "Mes anterior"/"Mes siguiente"); háptica de selección al cambiar.
  - **Filtro de tipo:** `ChoiceChips` "Todos / Gastos / Ingresos".
  - Resumen del mes bajo el selector: "Ingresos +$ X · Gastos −$ Y" (solo cuentas en la moneda principal, con `inCurrency` + `summarizeMonth`).
  - Lista agrupada por día con `groupByDay`: encabezado con `formatDayLabel` y las filas `MovementRow` dentro de un `Section`; tocar una fila abre `/movimiento?id=…`.
  - `EmptyState` ("📭 Sin movimientos este mes" + acción "Registrar movimiento") si no hay resultados.
  - `Fab` "Registrar movimiento" que abre `/movimiento`.
  - La carga usa `useFocusQuery` con un `useCallback` que depende del mes elegido, para que se actualice al volver de la hoja.
- [ ] **Step 2: Verificar:** `npx tsc --noEmit && npm test` y el export de Android en carpeta temporal.
- [ ] **Step 3: Commit.** `git commit -m "feat: pantalla de movimientos con meses y filtro por tipo"`

---

### Task 8: Pantalla Inicio

**Files:**
- Modify: `src/app/(tabs)/index.tsx` (reemplazar)

**Interfaces:**
- Consumes: `loadMonth`, `currentYearMonth`, `monthRange`, `monthLabel`; `summarizeMonth`, `splitBalances`, `inCurrency`; `useCountUp`, `ProgressBar`, `CategoryBadge`, `MovementRow`, `EmptyState`, `Fab`, `Screen`, `Section`, `AppText`; `useAuth`; `formatMoney`.

- [ ] **Step 1: Implementar la pantalla** (mes actual; cada bloque entra con `FadeInDown.duration(300).reduceMotion(ReduceMotion.System)` y retraso escalonado de 60 ms):
  - **Saludo** "Hola, {nombre} 👋" (footnote secundario) y título grande "Inicio".
  - **Tarjeta principal** (fondo `c.card`, radio 24, relleno 24): etiqueta "Saldo total", monto de 40 pt en negrita usando `useCountUp(total)` con `formatMoney`; debajo dos columnas "Ingresos del mes  +$ X" (verde) y "Gastos del mes  −$ Y". Si `splitBalances(...).otherCurrencies` no está vacío, una nota: "No incluye cuentas en USD, EUR…".
  - **Gastos del mes por categoría**, en dos `Section`: "📌 Fijos · $ total" y "🔀 Variables · $ total". Cada fila: `CategoryBadge`, nombre, monto y debajo un `ProgressBar` con el `share` de esa categoría y su color. Una sección sin gastos no se muestra.
  - **Últimos movimientos:** los 5 más recientes con `MovementRow` y un enlace "Ver todos" que va a la pestaña Movimientos.
  - **Estado vacío:** sin ningún movimiento, `EmptyState` ("🌱 Aún no registras movimientos" + "Toca + para registrar tu primer gasto o ingreso") en lugar de los bloques de gastos y últimos movimientos; la tarjeta de saldo siempre se muestra.
  - `Fab` "Registrar movimiento".
- [ ] **Step 2: Verificar:** `npx tsc --noEmit && npm test` y el export de Android en carpeta temporal.
- [ ] **Step 3: Commit.** `git commit -m "feat: pantalla de inicio con saldo y gastos por categoría"`

---

### Task 9: Verificación final y entrega

- [ ] **Step 1:** `npm test`, `npx supabase test db` y `npx tsc --noEmit`. Expected: todo en PASS / sin errores.
- [ ] **Step 2:** Pedir permiso al usuario y subir la migración a la nube: `npx supabase db push`.
- [ ] **Step 3: Prueba manual en el navegador** (`npx expo start --web`) o en el celular, en este orden:
  1. Inicio vacío: saldo igual al saldo inicial de la cuenta y mensaje 🌱.
  2. Tocar **+**, registrar un gasto de `25.000` en Comida → vuelve a Inicio: el saldo baja, aparece en "Variables" con su barra y en "Últimos movimientos".
  3. Registrar un ingreso de `3.000.000` en Salario → el saldo sube y "Ingresos del mes" lo suma.
  4. Movimientos: el gasto en la lista con emoji y color, `-$ 25.000`; el ingreso en verde con `+`.
  5. Tocar un movimiento → editar el monto y guardar; luego eliminarlo.
  6. Ajustes → Cuentas → eliminar la cuenta con movimientos → mensaje "No se puede eliminar porque tiene movimientos…".
  7. Cambiar al mes anterior en Movimientos → vacío con mensaje.
  8. Modo oscuro del sistema: textos legibles en ambas pantallas.
- [ ] **Step 4:** Revisión final de la rama y `superpowers:finishing-a-development-branch`.
