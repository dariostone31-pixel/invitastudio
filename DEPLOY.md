# Guía de Deploy en Producción — InvitaStudio

La aplicación está preparada para correr sin fricción en **Vercel + Supabase (PostgreSQL) + Mercado Pago Checkout Pro**.

---

## 1. Base de Datos en Supabase (Gratis / Tier Inicial)
1. Creá un proyecto nuevo en [supabase.com](https://supabase.com).
2. *(Opcional)* Abrí **SQL Editor** y pegá el contenido de `supabase/schema.sql` (si no lo hacés manualmente, el backend auto-crea las tablas `events` y `rsvps` y los 2 eventos demo en la primera consulta).
3. En **Project Settings → Database → Connection string (Transaction Pooler, puerto `6543`)**, copiá la URI:
   ```
   postgresql://postgres.[REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```
4. En **Storage → New Bucket**, creá un bucket público llamado `event-uploads` para que las fotos que suban tus clientes persistan entre deploys en Vercel. Copiá tu `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` desde **Project Settings → API**.

---

## 2. Mercado Pago Checkout Pro (Argentina)
1. Ingresá a [mercadopago.com.ar/developers/panel/app](https://www.mercadopago.com.ar/developers/panel/app) y creá una aplicación de tipo **Pagos online → Checkout Pro**.
2. Copiá tu **Access Token** (`APP_USR-...` de Producción o Prueba).
3. En la sección **Webhooks** de tu app de Mercado Pago, configurá:
   - **URL de producción:** `https://TU-DOMINIO.vercel.app/api/mercadopago/webhook`
   - **Eventos:** `Pagos (payment)`
4. Cuando un cliente pague con Checkout Pro, el webhook verifica el pago directo contra la API oficial de Mercado Pago (`Payment.get`), marca `paymentStatus = "pagado"` y promueve el pedido automáticamente a `"en_edicion"`.

---

## 3. Deploy en Vercel (5 minutos)
1. Subí la carpeta `invitaciones-app` a GitHub (o importala desde Vercel).
2. En **Vercel → Settings → Environment Variables**, cargá:
   - `NEXT_PUBLIC_SITE_URL` = `https://tu-dominio.com`
   - `DATABASE_URL` = tu URI de Supabase Pooler
   - `MP_ACCESS_TOKEN` = tu Access Token de Mercado Pago
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` = `549...` (tu WhatsApp comercial sin `+`)
   - `NEXT_PUBLIC_BANK_ALIAS` = tu Alias bancario o CVU
   - `ADMIN_PASSCODE` = tu clave secreta para `/admin`
3. Hacé clic en **Deploy**.
4. Verificá el endpoint `https://tu-dominio.com/api/health`: debería responder:
   ```json
   { "ok": true, "dbMode": "postgres", "mercadopagoConfigured": true }
   ```

