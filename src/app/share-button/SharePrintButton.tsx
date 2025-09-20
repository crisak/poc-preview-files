import React, { useState } from "react";

type SharePrintButtonProps = {
  fileUrl: string; // URL del PDF/imagen
  suggestedName?: string; // nombre sugerido p.ej. "label.pdf"
};

export function SharePrintButton({
  fileUrl,
  suggestedName = "document.pdf",
}: SharePrintButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleShare = async () => {
    setError(null);
    setBusy(true);
    try {
      // 1) Traer el archivo como Blob (respeta cookies si necesitas auth)
      const res = await fetch(fileUrl, { credentials: "include" });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const blob = await res.blob();

      // 2) Crear un File con MIME correcto para que el SO muestre "Imprimir"
      const filename = suggestedName || "document";
      const file = new File([blob], filename, {
        type: blob.type || "application/octet-stream",
      });

      // 2.2 show alert if support share API or not
      if ((navigator as any)?.share || (navigator as any)?.canShare) {
        alert("✅ Browser supported share API");
      } else {
        alert("❌ Browser not supported share API");
      }

      // 3) Verificar soporte (Web Share Level 2) y compartir
      if ((navigator as any).canShare?.({ files: [file] })) {
        console.log("Soporta share de archivos");
        await (navigator as any).share({
          title: filename,
          text: "Compartir / Imprimir",
          files: [file],
        });
        // La hoja nativa suele mostrar "Imprimir" si es PDF/imagen
      } else {
        console.log("No soporta share de archivos");
        // Fallback: abrir en nueva pestaña si no soporta share de archivos
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener");
        // Tip: ahí el usuario puede usar "Imprimir" del visor del navegador/SO
      }
    } catch (e: any) {
      setError(e.message || "Error al compartir");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button onClick={handleShare} disabled={busy} style={{ padding: 8 }}>
      {busy ? "Preparando…" : "Compartir / Imprimir"}
    </button>
  );
}
