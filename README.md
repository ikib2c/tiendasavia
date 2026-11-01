# SAVIA — Tienda online de skincare botánico

Repositorio del sitio web estático de **SAVIA**, marca de skincare botánica contemporánea para Colombia.

## Estructura
```
index.html          # Home (héroe, presentación, productos, rutinas, FAQ, contacto)
producto.html?id=X  # Ficha de producto con personalización de color de envase
assets/css/style.css        # Tokens de diseño SAVIA (verde #536B50, marfil #F4EFE5, Cormorant Garamond + DM Sans)
assets/js/main.js           # Catálogo, filtros, carrito, checkout por WhatsApp
data/configuracion.js       # Configuración pública de la tienda
data/catalogo.js            # Catálogo de productos con variantes de color por producto
img/                        # Imágenes de productos y marca
sitemap.xml, robots.txt
```

## Paleta cromática (brief de branding §5.2)
- Verde SAVIA `#536B50` — principal, logotipo, botones
- Verde niebla `#DCE4D5` — fondos secundarios
- Marfil natural `#F4EFE5` — fondo principal
- Arena `#C6A98B` — acentos cálidos
- Grafito vegetal `#333A32` — texto, contraste

## Tipografía
- Cormorant Garamond — titulares y logotipo
- DM Sans — cuerpo, navegación, fichas, botones

## Personalización de color por producto
Cada producto en `data/catalogo.js` define `var: { Color: [...] }` y `color: { nombre: hex }`. En `producto.html` se renderizan chips de color que el cliente puede seleccionar antes de agregar al carrito o pedir por WhatsApp; el color elegido viaja en el mensaje de WhatsApp.

## Despliegue
Sitio estático listo para GitHub Pages (`ikib2c.github.io/tiendasavio/`). Solo requiere servir los archivos HTML/CSS/JS; no hay build step ni backend.

## Contacto
WhatsApp: +57 300 757 9993

**SAVIA — Tu piel, en su mejor esencia.**
