# 🚀 Guía de Exportación y Publicación en GitHub Pages
## ELIBETH DEL VALLE STORE | *El renacer de mi fuerza*

Esta aplicación está **100% preparada y optimizada** para publicarse de forma gratuita en **GitHub Pages** como una Single Page Application (SPA) estática de alto rendimiento.

---

### ✨ Características Autónomas en GitHub Pages (Cero Servidores Requeridos)
- **Tasa Oficial BCV en Vivo:** Se conecta directamente desde el navegador del cliente a la API oficial (`dolarapi.com`) con CORS habilitado.
- **Catálogo Venezolano Completo:** Ropa íntima de damas, jeans levanta cola, conjuntos suplex, ropa deportiva y caballeros precargados con imágenes relativas.
- **Panel Administrativo:** Permite agregar o editar productos, fotos y tasas con persistencia automática en el almacenamiento local (`localStorage`).
- **Bot Asesor de Estilo & Gestor de Pedidos:** Responde dudas de tallas, dropshipping, calcula precios en bolívares y compila el pedido directamente a **WhatsApp `0422-0217446`**.

---

### 📋 Pasos para Publicar en GitHub Pages

#### Paso 1: Subir el proyecto a un repositorio en GitHub
Si tienes Git instalado en tu computadora o terminal:
```bash
# 1. Iniciar git y añadir los archivos
git init
git add .
git commit -m "feat: Lanzamiento Elibeth Del Valle Store con Bot WhatsApp y BCV"

# 2. Conectar con tu repositorio de GitHub (reemplaza con tu URL)
git branch -M main
git remote add origin https://github.com/TU_USUARIO/elibeth-del-valle-store.git

# 3. Subir el código
git push -u origin main
```

#### Paso 2: Activar GitHub Pages en el Repositorio
1. Ve a tu repositorio en GitHub (`https://github.com/TU_USUARIO/elibeth-del-valle-store`).
2. Haz clic en la pestaña **Settings** (Configuración) arriba a la derecha.
3. En el menú lateral izquierdo, haz clic en **Pages**.
4. En la sección **Build and deployment** (Compilación y despliegue):
   - En **Source**, selecciona: **GitHub Actions**.
5. ¡Listo! El archivo automatizado `.github/workflows/deploy.yml` que ya creamos se encargará de compilar el proyecto y publicarlo automáticamente.

#### Paso 3: Ver tu tienda en línea
En unos 60 a 90 segundos, tu tienda estará disponible en:
```
https://TU_USUARIO.github.io/elibeth-del-valle-store/
```

---

### 🛠️ Si prefieres subir la carpeta `dist` manualmente
También puedes compilar en tu computadora y subir los archivos estáticos:
```bash
# Compilar la aplicación
npm run build
```
Esto genera la carpeta `/dist` con todo el HTML, CSS, JavaScript e imágenes listos para arrastrar o subir directamente a GitHub o a cualquier hosting gratuito (como Vercel, Netlify o GitHub Pages con la rama `gh-pages`).
