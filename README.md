# POC Preview App

Este proyecto es una demostración de diferentes propuestas para solucionar el problema de previsualización e impresión de archivos en PWAs, específicamente el ticket reportado PAP_2611.

## Problema

Los usuarios reportan que al usar `window.open()` para previsualizar archivos desde una PWA, no pueden imprimir directamente y requieren pasos adicionales como capturas de pantalla.

## Soluciones Implementadas

### 1. Propuesta iframe (Página: `/iframe-solution`)

- **Enfoque**: Previsualización nativa usando iframe con blob URL
- **Ventajas**:
  - Implementación simple y rápida
  - Funciona bien en Android/Chrome
  - No requiere librerías adicionales
  - Soporte nativo para PDFs e imágenes
- **Consideraciones**:
  - En iOS/Safari PWA puede ser inconsistente
  - Algunas versiones requieren gesto del usuario para imprimir

### 2. Propuesta PDF.js (Página: `/pdfjs-solution`)

- **Enfoque**: Renderizado con PDF.js para mayor control
- **Ventajas**:
  - Funciona consistentemente en PWAs (iOS/Android)
  - Control total sobre la interfaz de usuario
  - Soporte para navegación entre páginas
  - No depende del visor nativo del navegador
- **Consideraciones**:
  - Aumenta el tamaño del bundle
  - Requiere configuración adicional del worker
  - Solo funciona con archivos PDF

### 3. Propuesta HTML-to-Print (Página: `/html-print-solution`)

- **Enfoque**: Renderizado HTML optimizado para impresión térmica
- **Ventajas**:
  - Optimizado para impresoras térmicas (4"x6")
  - Control total sobre el diseño y layout
  - No requiere archivos PDF externos
  - Imprime nítido en impresoras térmicas
  - Funciona perfectamente en PWAs
- **Consideraciones**:
  - Solo para contenido que se puede representar en HTML
  - Requiere diseño específico para cada tipo de etiqueta

## Características del POC

- ✅ Aplicación PWA completa (instalable en dispositivos móviles)
- ✅ Previsualización de PDFs, imágenes y archivos de texto
- ✅ Funcionalidad de impresión integrada en cada propuesta
- ✅ Solución al problema reportado en ticket PAP_2611
- ✅ TypeScript correctamente implementado
- ✅ Páginas separadas para cada propuesta

## Instalación y Uso

1. **Instalar dependencias**:

   ```bash
   npm install
   ```

2. **Ejecutar en desarrollo**:

   ```bash
   npm run dev
   ```

3. **Construir para producción**:

   ```bash
   npm run build
   npm run start
   ```

4. **Exportar como PWA estática**:
   ```bash
   npm run build
   # Los archivos se generan en la carpeta 'out'
   ```

## Testing en Dispositivos Móviles

1. Construir el proyecto: `npm run build`
2. Servir los archivos estáticos desde la carpeta `out`
3. Acceder desde un dispositivo móvil
4. Instalar como PWA desde el navegador
5. Probar cada propuesta de previsualización e impresión

## Archivos de Muestra

El proyecto incluye archivos de muestra en `/public/sample-files/`:

- `sample.html` - Etiqueta HTML de muestra
- `sample.svg` - Imagen SVG de muestra
- `sample.txt` - Archivo de texto de muestra

## Estructura del Proyecto

```
src/
├── app/
│   ├── iframe-solution/     # Propuesta 1: iframe
│   ├── pdfjs-solution/      # Propuesta 2: PDF.js
│   ├── html-print-solution/ # Propuesta 3: HTML-to-Print
│   ├── layout.tsx           # Layout principal con configuración PWA
│   └── page.tsx             # Página principal
public/
├── manifest.json            # Manifest de PWA
├── sw.js                    # Service Worker
├── pdf.worker.min.js        # Worker de PDF.js
└── sample-files/            # Archivos de muestra
```

## Configuración PWA

- **Manifest**: Configurado en `/public/manifest.json`
- **Service Worker**: Implementado en `/public/sw.js`
- **Icons**: Iconos SVG básicos para la PWA
- **Next.js PWA**: Configurado con `next-pwa`

## Próximos Pasos

1. Probar cada propuesta en diferentes dispositivos móviles
2. Evaluar la experiencia de usuario de cada solución
3. Medir el rendimiento y tamaño del bundle
4. Seleccionar la mejor propuesta para implementar en producción
5. Considerar una solución híbrida que combine las mejores características

## Notas Técnicas

- El proyecto está configurado para exportación estática (`output: 'export'`)
- PDF.js está configurado para funcionar en el lado del cliente
- Las imágenes y archivos se sirven desde la carpeta `public`
- El CSS está optimizado para impresión con `@page` rules
