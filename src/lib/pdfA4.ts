/**
 * Genera un archivo PDF A4 válido (595.28 x 841.89 pt) en memoria,
 * colocando 4 copias del cartel QR en una grilla 2x2 con marcas de corte finas.
 * Cero dependencias externas y costo marginal $0.
 */
export function buildA4FourUpQrPdf(
  jpegBytes: Uint8Array,
  imgWidthPx: number,
  imgHeightPx: number
): Blob {
  // Dimensiones A4 en puntos PDF (1 pt = 1/72 inch)
  const pageW = 595.28;
  const pageH = 841.89;

  // Cada tarjeta ocupa aprox 9.4 x 11.75 cm (proporción 4:5) en grilla 2x2
  const marginX = 24;
  const marginY = 36;
  const gapX = 16;
  const gapY = 20;

  const slotW = (pageW - marginX * 2 - gapX) / 2;
  const slotH = (pageH - marginY * 2 - gapY) / 2;

  const aspect = imgWidthPx / imgHeightPx;
  let drawW = slotW;
  let drawH = drawW / aspect;
  if (drawH > slotH) {
    drawH = slotH;
    drawW = drawH * aspect;
  }

  const positions = [
    // Fila superior (en coordenadas PDF Y=0 está abajo)
    {
      x: marginX + (slotW - drawW) / 2,
      y: pageH - marginY - drawH - (slotH - drawH) / 2,
    },
    {
      x: marginX + slotW + gapX + (slotW - drawW) / 2,
      y: pageH - marginY - drawH - (slotH - drawH) / 2,
    },
    // Fila inferior
    {
      x: marginX + (slotW - drawW) / 2,
      y: marginY + (slotH - drawH) / 2,
    },
    {
      x: marginX + slotW + gapX + (slotW - drawW) / 2,
      y: marginY + (slotH - drawH) / 2,
    },
  ];

  // Contenido gráfico: guías sutiles de corte + 4 imágenes
  const cmds: string[] = [];
  cmds.push("q");
  cmds.push("0.75 w 0.72 0.70 0.68 RG [3 3] 0 d");
  for (const p of positions) {
    cmds.push(
      `${p.x.toFixed(2)} ${p.y.toFixed(2)} ${drawW.toFixed(2)} ${drawH.toFixed(2)} re S`
    );
  }
  cmds.push("Q");
  for (const p of positions) {
    cmds.push("q");
    cmds.push(
      `${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${p.x.toFixed(2)} ${p.y.toFixed(2)} cm`
    );
    cmds.push("/Im0 Do");
    cmds.push("Q");
  }
  const contentStreamStr = cmds.join("\n");

  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let bytePos = 0;

  const pushStr = (s: string) => {
    const b = enc.encode(s);
    chunks.push(b);
    bytePos += b.length;
  };
  const pushBytes = (b: Uint8Array) => {
    chunks.push(b);
    bytePos += b.length;
  };
  const startObj = (id: number) => {
    offsets[id] = bytePos;
    pushStr(`${id} 0 obj\n`);
  };

  pushStr("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");

  // 1: Catalog
  startObj(1);
  pushStr("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // 2: Pages
  startObj(2);
  pushStr("<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  // 3: Page A4
  startObj(3);
  pushStr(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  );

  // 4: Image XObject (JPEG)
  startObj(4);
  pushStr(
    `<< /Type /XObject /Subtype /Image /Width ${imgWidthPx} /Height ${imgHeightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );
  pushBytes(jpegBytes);
  pushStr("\nendstream\nendobj\n");

  // 5: Content stream
  const contentBytes = enc.encode(contentStreamStr);
  startObj(5);
  pushStr(`<< /Length ${contentBytes.length} >>\nstream\n`);
  pushBytes(contentBytes);
  pushStr("\nendstream\nendobj\n");

  // Cross-reference table
  const xrefPos = bytePos;
  pushStr("xref\n0 6\n0000000000 65535 f \n");
  for (let i = 1; i <= 5; i++) {
    pushStr(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
  }
  pushStr(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`);

  const merged = new Uint8Array(bytePos);
  let cursor = 0;
  for (const c of chunks) {
    merged.set(c, cursor);
    cursor += c.length;
  }
  return new Blob([merged.buffer], { type: "application/pdf" });
}
