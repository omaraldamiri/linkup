// ── Image compression ──────────────────────────────────────────────────────────
// Resizes the image to a 256×256 max and re-encodes as JPEG at 65% quality.
// Reduces a typical 1–3 MB photo down to ~15–30 KB as a base64 string,
// preventing the MySQL MEDIUMTEXT cell from bloating to megabytes.

export const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.onload = () => {
        const MAX = 256;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.65));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
