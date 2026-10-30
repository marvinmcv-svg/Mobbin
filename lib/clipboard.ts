/** Copies an image to the clipboard as PNG (the format design tools accept on paste). */
export async function copyImage(src: string): Promise<void> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")?.drawImage(img, 0, 0);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/png");
    };
    img.onerror = () => reject(new Error("load failed"));
    img.src = src;
  });
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}
