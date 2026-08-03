# Juntos — organizador de viajes colaborativo

Guía paso a paso para tener tu web real, gratuita y con enlace propio.
No necesitas saber programar: son cuentas gratuitas y copiar/pegar.

## 1. Crear cuenta en Supabase (base de datos, login y archivos)

1. Ve a https://supabase.com y crea una cuenta gratuita (con GitHub o email).
2. Crea un **New project**. Ponle un nombre (ej. `juntos`) y una contraseña de base de datos (guárdala, no la necesitarás para nada del día a día).
3. Cuando el proyecto esté listo, ve a **SQL Editor** → **New query**.
4. Abre el archivo `supabase/schema.sql` de esta carpeta, copia todo su contenido, pégalo ahí y pulsa **Run**. Esto crea todas las tablas y los permisos necesarios.
5. Ve a **Project Settings → API**. Copia dos valores:
   - **Project URL**
   - **anon public key**
6. Ve a **Authentication → Providers → Email** y confirma que está activado (lo está por defecto). Esto es lo que envía el enlace mágico de acceso por correo.
7. Opcional pero recomendado: en **Authentication → URL Configuration**, añade la URL que te dará Vercel en el paso 3 como "Redirect URL" (puedes volver a este paso después).

⚠️ Nota importante del plan gratuito: si el proyecto está **7 días sin actividad**, Supabase lo pausa automáticamente (tus datos no se pierden, pero hay que "reanudarlo" con un clic desde el panel de Supabase). Si vas a compartir la app con tus conocidos, entrar de vez en cuando evita que se pause.

## 2. Configurar el proyecto localmente

1. Necesitas tener instalado **Node.js** (https://nodejs.org, versión LTS).
2. Descomprime esta carpeta y abre una terminal dentro de ella.
3. Copia `.env.example` como `.env` y rellena los dos valores que copiaste de Supabase:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
   ```
4. Instala las dependencias:
   ```
   npm install
   ```
5. Pruébalo en tu ordenador:
   ```
   npm run dev
   ```
   Abre la dirección que te muestre (normalmente `http://localhost:5173`).

## 3. Publicarla gratis en Vercel (enlace público)

1. Sube esta carpeta a un repositorio de GitHub (crea una cuenta gratuita en https://github.com si no tienes, crea un repositorio nuevo y sube los archivos).
2. Ve a https://vercel.com, crea una cuenta gratuita (puedes entrar directamente con tu cuenta de GitHub).
3. **Add New → Project**, elige el repositorio que acabas de subir.
4. En **Environment Variables**, añade las mismas dos variables que en tu `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Pulsa **Deploy**. En un par de minutos te da una URL pública, del tipo `https://juntos-tuusuario.vercel.app`.

Esa URL ya es tu web real y gratuita — funciona igual en el móvil (Safari/Chrome) que en el ordenador, porque es la misma web.

## 4. Compartirla con tus conocidos

- Envíales directamente el enlace de Vercel — así es como te pedían las dos opciones: es un enlace, y a la vez, desde el navegador del móvil pueden **"Añadir a pantalla de inicio"** (en el menú del navegador) para que se abra como una app con su propio icono.
- Cada persona entra con su correo (recibe un enlace mágico, sin contraseña que recordar) y luego, con el código de 6 caracteres del viaje, se une al panel.

## Qué incluye esta primera versión (Fase 1)

- Registro por correo (enlace mágico) y nombre de perfil
- Crear panel de viaje con código de invitación
- Transporte (adaptado según avión/tren/coche/bici...)
- Alojamiento
- Documentos: ahora sí con **subida de archivos reales** (fotos, PDFs) a través de Supabase Storage, además de enlaces
- Costes al estilo Tricount, con saldos y sugerencia de pagos para saldar cuentas
- Los cambios se ven en tiempo real entre los miembros del viaje

## Qué falta para la Fase 2 (cuando quieras seguir)

- Planificador con mapa (OpenStreetMap) y rutas
- Recomendaciones de turismo con IA

## Nota sobre seguridad

Para mantenerlo simple en este MVP, cualquier persona con sesión iniciada puede leer/escribir en la base de datos si conoce el `trip_id` correspondiente (el código de 6 caracteres actúa como la llave de acceso, igual que un enlace de invitación). Es razonable para probarlo con gente de confianza. Si más adelante quieres reforzarlo para que solo los miembros de cada viaje puedan ver sus propios datos, dímelo y ajustamos las políticas de Supabase.
