# Movimientos: guía de puesta en marcha

Tus datos se guardan en un archivo oculto de tu Google Drive (carpeta de datos de la app), solo accesible por esta app con tu cuenta.

## 1. Crear el Client ID de Google (10 min, gratis)
1. Entra a https://console.cloud.google.com y crea un proyecto nuevo.
2. Menú APIs y servicios > Biblioteca > habilita **Google Drive API**.
3. APIs y servicios > Pantalla de consentimiento de OAuth: tipo **Externo**, pon nombre y tu correo.
   Agrega los permisos `.../auth/drive.appdata` y `.../auth/userinfo.email`.
   Agrega tu cuenta como usuario de prueba y, cuando funcione, pulsa **Publicar aplicación** (con permisos no sensibles no pide verificación y evitas que el acceso caduque).
4. Credenciales > Crear credenciales > **ID de cliente de OAuth** > Aplicación web.
   En **Orígenes autorizados de JavaScript** agrega la URL donde la vas a hospedar (ej. `https://tuusuario.github.io`) y `http://localhost:8080` para pruebas. No necesitas URI de redireccionamiento.
5. Copia el ID y pégalo en `index.html`, en la constante `GOOGLE_CLIENT_ID` (al inicio del `<script>`).

## 2. Probar en tu computadora
`python3 -m http.server 8080` dentro de esta carpeta y abre http://localhost:8080

## 3. Hospedar (necesita HTTPS)
Sube los 5 archivos a GitHub Pages, Netlify (arrastrar la carpeta) o Vercel.

## 4. Instalar en el celular
- iPhone: Safari > Compartir > Agregar a pantalla de inicio.
- Android: Chrome > Instalar aplicación.

## Notas
- Para quitar el acceso: myaccount.google.com/permissions
- Si editas desde dos dispositivos a la vez, gana el último cambio guardado.
- El dictado funciona con reglas simples (sin IA): "gasté 250 en café con débito".
