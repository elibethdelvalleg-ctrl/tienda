# Guía de Publicación en GitHub Pages (Gratis)
## ELIBETH DEL VALLE STORE 🦁✨

La tienda ya está **100% configurada y lista** para ser desplegada en **GitHub Pages** de forma gratuita.

---

### Opción 1: Despliegue Automático con GitHub Actions (Recomendado)

Cada vez que hagas `git push` a tu repositorio en GitHub, la página se compilará y se publicará sola en internet.

#### Pasos:

1. **Crea un repositorio nuevo en GitHub:**
   - Ve a [github.com/new](https://github.com/new)
   - Ponle de nombre a tu repositorio, por ejemplo: `elibeth-store` o `elibeth-del-valle-store`.
   - Selecciona **Público** (o Privado).
   - Haz clic en **Create repository**.

2. **Sube el código a GitHub desde tu terminal:**
   ```bash
   git remote add origin https://github.com/TU_USUARIO/elibeth-store.git
   git branch -M main
   git push -u origin main
   ```

3. **Activar GitHub Pages en los Ajustes del Repositorio:**
   - En tu repositorio de GitHub, haz clic en la pestaña **Settings** (Ajustes).
   - En el menú izquierdo, ve a **Pages**.
   - Bajo **"Build and deployment" > "Source"**, selecciona **"GitHub Actions"**.
   - ¡Listo! En 1 o 2 minutos verás el enlace público de tu tienda:
     `https://TU_USUARIO.github.io/elibeth-store/`

---

### Opción 2: Despliegue Directo con comando `npm run deploy`

Si prefieres publicar directamente desde tu computadora usando la rama `gh-pages`:

1. Asegúrate de tener configurado tu repositorio remoto (`git remote -v`).
2. Ejecuta en tu terminal:
   ```bash
   npm run deploy
   ```
3. En GitHub > **Settings** > **Pages**, selecciona como fuente la rama `gh-pages` y carpeta `/ (root)`.

---

### ¿Por qué esta configuración funciona perfectamente en GitHub Pages?

- **Rutas Relativas (`base: './'`):** Los archivos JavaScript, CSS e imágenes cargan sin importar si la tienda está en la raíz de un dominio o en un subdirectorio (`github.io/nombre-repo/`).
- **Archivo `404.html` Automático:** Si el usuario recarga la página o entra a un enlace directo, GitHub Pages redirige a la aplicación de React sin mostrar errores de página no encontrada.
- **Archivo `.nojekyll`:** Evita que el motor interno de GitHub Pages bloquee archivos modernos o carpetas de la tienda.
- **Tasa BCV y Bot Autónomos:** La consulta de la tasa oficial del Banco Central de Venezuela y el bot de asesoría y pedidos a WhatsApp (+58 0422-0217446) funcionan 100% del lado del cliente en el navegador.
- **PWA e Instalación en Android:** Los íconos, el manifest y el service worker quedan activos para que tus clientes puedan instalar la app en su teléfono desde GitHub Pages.
