# MoneyApp — Diseño de la v1

Fecha: 2026-10-14
Estado: borrador para revisión

## 1. Propósito y alcance

App de finanzas personales al estilo Monai para **Android e iOS**.

- **Fase de uso:** primero el autor, luego ~7 amigos y conocidos; después se mejora y se publica en Play Store / App Store.
- **Éxito de la v1:** el autor y los 7 usuarios registran sus finanzas a diario y la app les resulta útil.
- **Usuarios:** cada persona tiene su cuenta y sus datos son privados. No hay finanzas compartidas entre usuarios.
- **Idioma:** español. **Monedas:** varias (cada cuenta tiene su moneda).
- **Conectividad:** requiere internet. Modo offline queda fuera de la v1.

### Fuera de alcance (v1)

Login con Google/Apple, notificaciones push, modo offline, otros idiomas, finanzas compartidas, conexión con bancos, publicación en tiendas.

## 2. Stack tecnológico

| Pieza | Tecnología |
|---|---|
| App móvil | Expo (React Native + TypeScript), Expo Router |
| Backend | Supabase (Auth, Postgres con RLS, Edge Functions) |
| IA (texto, consejos) | Modelo de lenguaje llamado desde la Edge Function `ai-parse` / `ai-insights` |
| IA (voz) | Transcripción de audio en la Edge Function, luego el mismo flujo de texto |
| Gráficas | `victory-native` |
| Animaciones | `react-native-reanimated` |
| Hojas inferiores | `@gorhom/bottom-sheet` |
| Háptica / blur / audio / íconos | `expo-haptics`, `expo-blur`, `expo-audio`, `expo-symbols` |
| Builds | EAS Build (iOS sin Mac) |

Razón: el autor tiene poca experiencia; JavaScript/TypeScript tiene la mayor comunidad, Expo Go permite probar en el celular al instante y Supabase cubre auth, base de datos y servidor en su plan gratuito. La clave de la IA vive solo en el servidor.

**Costo esperado:** planes gratuitos de Supabase/Expo + pocos USD/mes de IA para 7 usuarios. Distribuir en iOS requiere Apple Developer (99 USD/año, TestFlight); en Android se comparte el APK gratis.

## 3. Modelo de datos

Todas las tablas tienen `user_id` y políticas RLS: cada usuario solo lee y escribe sus filas.

| Tabla | Campos principales |
|---|---|
| `profiles` | `id`, `name`, `main_currency` |
| `accounts` | `id`, `name`, `type` (efectivo/banco/tarjeta), `currency`, `initial_balance` |
| `groups` | `id`, `name` (Fijos, Variables, Ahorro…), `allocation_type` (`percent`/`amount`), `allocation_value`, `is_fixed` |
| `categories` | `id`, `name`, `kind` (`expense`/`income`), `group_id` (solo gastos), `emoji`, `color` |
| `transactions` | `id`, `account_id`, `category_id`, `kind` (`expense`/`income`/`transfer`), `amount`, `date`, `note`, `source` (`manual`/`chat`/`voice`), `to_account_id` y `goal_id` (transferencias) |
| `budgets` | `id`, `category_id`, `monthly_limit` |
| `goals` | `id`, `name`, `target_amount`, `currency`, `deadline`, `emoji` |
| `exchange_rates` | `date`, `base`, `quote`, `rate` (compartida, solo lectura para usuarios) |
| `insights` | `id`, `month`, `content` (consejos generados) |
| `ai_usage` | `user_id`, `date`, `count` (límite diario) |

**Reglas:**
- Montos como **enteros en la unidad mínima** de la moneda (centavos). Nada de decimales flotantes.
- El **saldo de una cuenta no se guarda**: `initial_balance + Σ movimientos`.
- El progreso de una meta es la suma de las transferencias hacia ella.
- Un gasto es "fijo" o "variable" según el `is_fixed` de su grupo.
- Los totales en la moneda principal usan la tasa del día del movimiento (o la última conocida).
- Las tasas se descargan una vez al día con una Edge Function programada desde una API gratuita que incluya COP (p. ej. `open.er-api.com`).

## 4. Pantallas

Barra inferior con 5 pestañas.

### 4.1 Inicio
- Saldo total en la moneda principal (número animado).
- Ingresos vs. gastos del mes.
- **Gastos del mes por categoría**, cada uno con barra contra su presupuesto; si se excede: rojo + "Excedido por $X".
- Gastos separados en bloques **Fijos** y **Variables**.
- Últimos movimientos y botón **+** grande.

### 4.2 Chat
- Texto libre ("gasté 25 mil en almuerzo con la Nequi") o nota de voz manteniendo presionado el micrófono.
- La IA responde con una tarjeta (monto, categoría, cuenta, fecha) con **Confirmar** / **Editar**. Si falta un dato, lo pregunta.
- **La IA nunca guarda sin confirmación del usuario.**

### 4.3 Movimientos
- Lista completa; cada movimiento muestra el **emoji y color de su categoría**. Ingresos en verde con su categoría (Salario, Ingreso extra…).
- Filtros: tipo, mes, cuenta, categoría. Tocar para editar o eliminar.

### 4.4 Reportes
- Dona por categoría y por grupo; barras ingresos vs. gastos de los últimos 6 meses.
- Presupuestos: verde, amarillo desde 80 %, rojo desde 100 %.
- Avance de metas.
- Asignado vs. gastado por grupo.
- **Consejos:** botón que pide a la IA 3–5 consejos concretos del mes. Solo se envían agregados (totales por categoría, grupo, presupuesto, meta), nunca movimientos individuales. Se guardan en `insights` para no regenerarlos en cada visita.

### 4.5 Ajustes
Cuentas, grupos y sus porcentajes/montos, categorías (emoji + color), presupuestos, metas, moneda principal, cerrar sesión.

## 5. Flujos

- **Primer uso:** registro con correo → moneda principal → primera cuenta → grupos y categorías por defecto (Fijos 50 %, Variables 30 %, Ahorro 20 %) editables.
- **Registrar ingreso:** al guardar se muestra el reparto entre grupos (ej. 3.000.000 → Fijos 1.500.000, Variables 900.000, Ahorro 600.000).
- **Aportar a una meta:** transferencia hacia la meta, para no contar el dinero dos veces.
- **Alertas de presupuesto:** dentro de la app (sin push en v1).

## 6. IA (Edge Functions)

- **`ai-parse`:** recibe texto o audio. Si es audio, transcribe primero. Le pasa al modelo el texto + las cuentas y categorías del usuario y pide una salida JSON estructurada: `{kind, amount, currency, category_id, account_id, date, note, missing[]}`. Valida la respuesta antes de devolverla.
- **`ai-insights`:** recibe los agregados del mes y devuelve 3–5 consejos en español.
- **Límite:** 50 llamadas por usuario al día (`ai_usage`).
- Las claves de los proveedores de IA viven solo como secretos de Supabase.

## 7. Diseño visual

Minimalista, al estilo Apple, **idéntico en iOS y Android** (sin Material Design en Android).

- Human Interface Guidelines de Apple como referencia.
- Mucho espacio en blanco, tarjetas con radio 16, sombras muy suaves.
- Modo claro y oscuro según el sistema.
- Paleta: fondos grises de sistema de iOS, acento azul de sistema, verde para ingresos, rojo para excesos.
- Tipografía: fuente del sistema (SF Pro) en iOS; **Inter** incluida en Android (SF Pro no tiene licencia para Android).
- Títulos grandes que se encogen al hacer scroll.
- **Emojis** como íconos de categorías y metas. En Android se ven con el diseño de Google (los emojis de Apple no se pueden incluir legalmente).
- Animaciones con resorte: tarjetas que aparecen, saldo que cuenta hacia arriba, barras que se llenan.
- Bottom sheets para registrar y editar.
- Háptica al confirmar, al cumplir una meta 🎉 y al exceder un presupuesto.
- Barra de pestañas y encabezados con blur.
- SF Symbols en iOS y equivalentes de estilo similar en Android.

## 8. Manejo de errores

| Situación | Comportamiento |
|---|---|
| Sin internet | Aviso "Sin conexión"; se desactiva guardar. |
| La IA no entiende o falla | "No entendí, ¿puedes reformularlo?" + formulario manual prellenado con lo que extrajo. |
| Límite de IA alcanzado | Mensaje claro; el formulario manual sigue disponible. |
| Tasa de cambio no disponible | Usa la última conocida y muestra su fecha. |
| Acceso a datos ajenos | Bloqueado por RLS en la base de datos. |

## 9. Pruebas

- Unitarias de la lógica de dinero: reparto por grupos, conversión de monedas, cálculo de saldos, presupuestos excedidos.
- Pruebas de RLS: un usuario no puede leer ni modificar datos de otro.
- Conjunto de 15–20 frases típicas para `ai-parse` con el resultado esperado.
- Pantallas: prueba manual en el celular con Expo Go.

## 10. Fases de construcción

1. **Base:** proyecto Expo, Supabase, login, primer uso, cuentas, grupos, categorías.
2. **Registro manual:** formulario, lista de movimientos con emojis y colores, Inicio con saldo y gastos por categoría. *(Desde aquí ya se puede usar.)*
3. **Presupuestos, metas y reparto del ingreso por grupos.**
4. **Reportes y gráficas.**
5. **IA:** chat por texto → consejos → voz.
6. **Varias monedas y tasas de cambio.**
7. **Pulido y distribución:** animaciones finas, modo oscuro, íconos, APK (Android) y TestFlight (iOS).
