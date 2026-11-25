# ¿Dónde estacioné?

App web móvil en React para guardar dónde estacionaste, añadir una nota opcional y abrir el lugar en un mapa al volver.

## Desarrollo

```bash
npm install
npm run dev
```

## Publicación

```bash
npm run build
```

Publicá el contenido de `dist/` en un hosting estático con HTTPS y fallback de rutas a `index.html`. HTTPS es necesario para que el navegador permita la geolocalización. La app es una PWA; su service worker precarga el documento, el manifiesto, el ícono y los recursos de producción para poder abrirla sin conexión después de la primera carga.

Los estacionamientos se guardan en el almacenamiento local del navegador. No hay cuenta ni sincronización entre dispositivos. Los mapas externos y el mapa de corrección necesitan internet.
