suggestion: Yes—you can embed and print **inside the app** without opening a new tab. Two solid approaches:

1. Quick win (native preview via `<iframe>`/`<embed>`):
   - Serve the file with headers that favor inline preview:
     - `Content-Type: application/pdf` (or image mime)
     - `Content-Disposition: inline; filename="label.pdf"`
   - Render it in-app with an `<iframe>` and trigger `print()` from the iframe when ready.

   **React example (PDF or image via blob URL):**

   ```tsx
   import { useEffect, useRef, useState } from "react";

   type Props = { fileUrl: string; autoPrint?: boolean };

   export function InlinePreview({ fileUrl, autoPrint = false }: Props) {
     const iframeRef = useRef<HTMLIFrameElement>(null);
     const [blobUrl, setBlobUrl] = useState<string>("");

     useEffect(() => {
       let active = true;
       let url: string;
       (async () => {
         const res = await fetch(fileUrl, { credentials: "include" });
         if (!res.ok) throw new Error("Failed to fetch file");
         const blob = await res.blob(); // works for PDF/images
         url = URL.createObjectURL(blob);
         if (active) setBlobUrl(url);
       })();
       return () => {
         active = false;
         if (url) URL.revokeObjectURL(url);
       };
     }, [fileUrl]);

     const handlePrint = () => {
       const i = iframeRef.current;
       if (i?.contentWindow) i.contentWindow.print();
     };

     return (
       <div
         style={{ height: "100vh", display: "flex", flexDirection: "column" }}
       >
         <div style={{ padding: 8, display: "flex", gap: 8 }}>
           <button onClick={handlePrint}>Print</button>
         </div>
         {blobUrl && (
           <iframe
             ref={iframeRef}
             src={blobUrl}
             title="Preview"
             style={{ flex: 1, width: "100%", border: 0 }}
           />
         )}
       </div>
     );
   }
   ```

Notes & caveats (mobile):
• Android/Chrome: usually supports inline PDF in <iframe> and contentWindow.print().
• iOS/Safari PWA (standalone/WKWebView): inline PDF rendering and programmatic print() can be inconsistent. Some iOS versions open the system viewer modal; others require a user gesture (tap a button) to invoke print. Keep the explicit Print button.
• If the browser refuses inline preview, fall back to the PDF.js route below.

    2.	Robust/consistent (PDF.js renderer):
    •	Use pdfjs-dist to render the PDF inside your React view. This avoids relying on the browser’s built-in PDF viewer and behaves more consistently in PWAs.
    •	PDF.js includes a printing service; you can hook a Print button to it.

Minimal React sketch (render first page + print):

```js
import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';

type PdfJS = typeof pdfjsLib;

export function PdfJsViewer({ fileUrl }: { fileUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pdf = await (pdfjsLib as PdfJS).getDocument({ url: fileUrl, withCredentials: true }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport }).promise;
    })();
    return () => { cancelled = true; };
  }, [fileUrl]);

  const handlePrint = async () => {
    // Simple approach: open browser print of current view
    window.print();
    // Advanced: wire up pdfjs printService (omitted for brevity),
    // or render pages into a hidden iframe and call iframe.print().
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 8 }}>
        <button onClick={handlePrint}>Print</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
```

Pros:
• Works inside PWA on iOS/Android with fewer surprises.
• You control toolbar, zoom, pagination, and print UX.
Cons:
• Slightly heavier (bundle size). Consider lazy-loading pdfjs-dist.

issue: Relying on window.open(url, '\_blank') forces users into another app/previewer on many mobiles and loses control over the print flow. This is precisely what your users are complaining about.

suggestion: For labels, consider HTML-to-print (no PDF) for best speed and reliability:
• Render the label as a dedicated HTML route/component sized to the label (e.g., 4x6in).
• Apply @page { size: 4in 6in; margin: 0 } and screen/print-specific CSS.
• Load that route inside an <iframe> and call iframe.contentWindow.print() after load (or let the user tap Print).
• This avoids PDF viewers entirely and prints razor-sharp on thermal printers.
