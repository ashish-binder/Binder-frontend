// Printable / downloadable Vendor Purchase Order (VPO) document.
//
// The same markup powers two outputs:
//   • printVpo()       — opens a standalone window and triggers the print dialog, so the
//                        printout is pixel-clean and never inherits the dashboard's styles.
//   • downloadVpoPdf() — renders the markup off-screen and saves it as an A4 PDF.
//
// All CSS is scoped under `.vpo-doc` so it can be injected into the running app (for the
// PDF render) without leaking styles onto the dashboard.

// Company header — fixed for Creative Home Decor LLP.
export const COMPANY = {
  name: 'CREATIVE HOME DECOR LLP',
  address:
    'KHASRA # 54-9, 2-13 NEAR POWER HOUSE, VPO BRAHMAN MAJRA, PANIPAT, HARYANA (132103)',
  gst: '06AAUFC6113C1ZO',
  email: 'info@creativehomedecorsllp.com',
};

export const DEFAULT_TERMS = [
  'BILL SUBMISSION AGAINST GOODS RECEIPT NOTE ONLY',
  'NOTE: GOODS WILL BE ACCEPTED ONLY UNDER POLYWRAPPED CONDITION.',
].join('\n');

const esc = (v) => {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const fmtNum = (v) => {
  if (v === null || v === undefined || v === '') return '';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString('en-IN', { maximumFractionDigits: 3 });
};

const fmtMoney = (v) => {
  if (v === null || v === undefined || v === '') return '';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDate = (v) => {
  if (!v) return '';
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
  } catch {
    return String(v);
  }
};

// A label/value row inside the FROM / TO blocks. Both sides align left so the
// two columns read as one consistent block.
const kv = (label, value) => `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`;

/* ------------------------------------------------------------------ *
 * Styles — brand orange + grey. Every rule is scoped under `.vpo-doc`.
 * `print-color-adjust: exact` is set on every element so Chrome/Edge actually
 * paint the coloured bands (their "Background graphics" option is off by default).
 * ------------------------------------------------------------------ */
export const VPO_STYLES = `
.vpo-doc {
  --brand: #f94d00; --brand-soft: #fff2ec; --line: #cfd2d8;
  --ink: #1f2937; --muted: #6b7280; --zebra: #fafafb;
  font-family: "Segoe UI", Inter, Arial, Helvetica, sans-serif;
  color: var(--ink); font-size: 12px; background: #fff;
}
.vpo-doc, .vpo-doc *, .vpo-doc *::before, .vpo-doc *::after {
  box-sizing: border-box;
  /* !important — the UA's print stylesheet otherwise wins and strips backgrounds. */
  -webkit-print-color-adjust: exact !important;
  color-adjust: exact !important;
  print-color-adjust: exact !important;
}
.vpo-doc table { border-collapse: collapse; width: 100%; }
.vpo-doc td, .vpo-doc th {
  border: 1px solid var(--line); padding: 5px 8px; vertical-align: middle; text-align: left;
}
/* The two header halves and the signature cells stay top-anchored. */
.vpo-doc .half, .vpo-doc .sig { vertical-align: top; }
.vpo-doc .title {
  text-align: center; font-weight: 700; font-size: 16px; letter-spacing: 3px;
  background: var(--brand); color: #fff; border-color: var(--brand); padding: 9px;
}
.vpo-doc .c { text-align: center; }
.vpo-doc .r { text-align: right; }
.vpo-doc .b { font-weight: 700; }
.vpo-doc .i { font-style: italic; }
.vpo-doc .half { width: 50%; padding: 0; vertical-align: top; }
.vpo-doc .blk {
  padding: 7px 9px; border-bottom: 1px solid var(--line); font-weight: 700;
  background: var(--brand-soft); color: var(--brand); letter-spacing: 0.4px;
}
.vpo-doc .addr {
  padding: 7px 9px; border-bottom: 1px solid var(--line);
  min-height: 36px; display: flex; align-items: center;
}
/* FROM has one address line, TO has two. Doubling FROM's height keeps both
   label tables starting on the same baseline. */
.vpo-doc .addr.tall { min-height: 72px; }
.vpo-doc table.kv { border: 0; table-layout: fixed; }
.vpo-doc table.kv th {
  font-weight: 700; border-left: 0; width: 46%;
  color: var(--muted); font-size: 11px; letter-spacing: 0.3px;
}
.vpo-doc table.kv th, .vpo-doc table.kv td { height: 24px; }
.vpo-doc table.kv td { border-right: 0; word-break: break-word; }
.vpo-doc table.kv tr:last-child th, .vpo-doc table.kv tr:last-child td { border-bottom: 0; }
.vpo-doc .items th {
  background: var(--brand); color: #fff; text-align: center; font-weight: 700;
  border-color: var(--brand); letter-spacing: 0.3px;
}
.vpo-doc .items tbody tr:nth-child(even) { background: var(--zebra); }
.vpo-doc .items td { height: 20px; }
.vpo-doc .tot td { background: var(--brand-soft); font-weight: 700; }
.vpo-doc .tot .amt { color: var(--brand); }
.vpo-doc .lbl { color: var(--muted); font-weight: 700; font-size: 11px; letter-spacing: 0.3px; }
.vpo-doc .term { padding: 1px 0; font-style: italic; color: var(--muted); }
.vpo-doc .sig { height: 60px; }
.vpo-doc .forco { background: var(--brand-soft); color: var(--brand); font-weight: 700; }
`;

// Extra rules that only make sense in the standalone print window.
const PRINT_STYLES = `
html, body { margin: 0; padding: 0; background: #fff; }
body { padding: 18px; }
@media print {
  html, body, *, *::before, *::after {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body { padding: 0; }
  @page { size: A4 portrait; margin: 10mm; }
  .no-print { display: none !important; }
  .vpo-doc .title, .vpo-doc .items thead, .vpo-doc .tot { break-inside: avoid; }
  .vpo-doc .items thead { display: table-header-group; }
}
`;

/* ------------------------------------------------------------------ *
 * Document body (no <html>/<head>) — reused by both print and PDF.
 * ------------------------------------------------------------------ */
export const buildVpoBody = (vpo) => {
  const lines = vpo?.lines || [];

  const rowsHtml = lines
    .map((l, i) => {
      const amount =
        l.amount !== undefined && l.amount !== null && l.amount !== ''
          ? fmtMoney(l.amount)
          : l.rate && l.qty
            ? fmtMoney(Number(l.qty) * Number(l.rate))
            : '';
      return `
        <tr>
          <td class="c">${i + 1}</td>
          <td>${esc(l.material_description)}</td>
          <td class="r">${esc(fmtNum(l.qty))}</td>
          <td class="c">${esc(l.unit)}</td>
          <td class="r">${esc(fmtMoney(l.rate))}</td>
          <td class="r">${esc(amount)}</td>
          <td>${esc(l.remark)}</td>
        </tr>`;
    })
    .join('');

  // Pad to at least 12 rows so the table keeps the template's tall look.
  const padRows = Math.max(0, 12 - lines.length);
  const padHtml = Array.from({ length: padRows })
    .map(() => '<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>')
    .join('');

  const totalQty =
    vpo?.total_qty !== undefined && vpo?.total_qty !== null && vpo?.total_qty !== ''
      ? fmtNum(vpo.total_qty)
      : fmtNum(lines.reduce((s, l) => s + (Number(l.qty) || 0), 0));

  const totalAmount =
    vpo?.total_amount !== undefined && vpo?.total_amount !== null && vpo?.total_amount !== ''
      ? fmtMoney(vpo.total_amount)
      : fmtMoney(
          lines.reduce(
            (s, l) =>
              s +
              (l.amount ? Number(l.amount) : (Number(l.qty) || 0) * (Number(l.rate) || 0)),
            0
          )
        );

  const vendorTitle = vpo?.vendor_code
    ? `${vpo.vendor_name || 'VENDOR'} (${vpo.vendor_code})`
    : vpo?.vendor_name || 'VENDOR (VENDOR CODE)';

  const termsHtml = String(vpo?.terms || DEFAULT_TERMS)
    .split('\n')
    .filter((t) => t.trim())
    .map((t) => `<div class="term">${esc(t)}</div>`)
    .join('');

  return `
  <table>
    <tr><td colspan="2" class="title">PURCHASE ORDER</td></tr>
    <tr>
      <td class="half">
        <div class="blk">FROM: ${esc(COMPANY.name)}</div>
        <div class="addr tall">${esc(COMPANY.address)}</div>
        <table class="kv">
          ${kv('GST:', COMPANY.gst)}
          ${kv('EMAIL:', COMPANY.email)}
          ${kv('COMPANY DISPATCH ADDRESS:', vpo?.company_dispatch_address)}
          ${kv('COMPANY DELIVERY ADDRESS:', vpo?.company_delivery_address)}
          ${kv('CONTACT PERSON:', vpo?.company_contact_person)}
          ${kv('WHATSAPP NO:', vpo?.company_whatsapp)}
          ${kv('IPO CODE:', vpo?.ipo_code)}
        </table>
      </td>
      <td class="half">
        <div class="blk">TO: ${esc(vendorTitle)}</div>
        <div class="addr">${esc(vpo?.vendor_address || 'VENDOR ADDRESS')}</div>
        <div class="addr i">${esc(vpo?.vendor_delivery_address || 'VENDOR DELIVERY ADDRESS')}</div>
        <table class="kv">
          ${kv('GST:', vpo?.vendor_gst)}
          ${kv('CONTACT PERSON:', vpo?.vendor_contact_person)}
          ${kv('WHATSAPP NO.:', vpo?.vendor_whatsapp)}
          ${kv('EMAIL:', vpo?.vendor_email)}
          ${kv('VPO NO:', vpo?.vpo_number)}
          ${kv('VPO DATE:', fmtDate(vpo?.vpo_date || vpo?.issued_at || vpo?.created_at))}
          ${kv('DELIVERY DUE DATE:', fmtDate(vpo?.delivery_due_date))}
          ${kv('PAYMENT TERMS:', vpo?.payment_terms)}
        </table>
      </td>
    </tr>
  </table>

  <table class="items" style="margin-top:-1px;">
    <thead>
      <tr>
        <th style="width:6%;">S.NO.</th>
        <th style="width:34%;">MATERIAL DESCRIPTION</th>
        <th style="width:12%;">PURCHASE QTY</th>
        <th style="width:8%;">UNIT</th>
        <th style="width:12%;">RATE (INR/UNIT)</th>
        <th style="width:14%;">AMOUNT</th>
        <th style="width:14%;">REMARK</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
      ${padHtml}
      <tr class="tot">
        <td colspan="2" class="r">TOTAL</td>
        <td class="r">${esc(totalQty)}</td>
        <td colspan="2"></td>
        <td class="r amt">${esc(totalAmount)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <table style="margin-top:-1px;">
    <tr>
      <td colspan="4">
        <span class="lbl">WASTAGE TOLERANCE</span><br/>
        ${esc(vpo?.wastage_tolerance)}
      </td>
      <td colspan="3" class="sig">
        <span class="lbl">RAISED BY</span><br/>
        <span class="b">${esc(vpo?.raised_by_name)}</span><br/>
        <span class="i">${esc(vpo?.raised_by_username)}</span>
      </td>
    </tr>
    <tr>
      <td colspan="4" class="lbl">TERMS &amp; CONDITIONS</td>
      <td colspan="3" class="forco">FOR ${esc(COMPANY.name)}</td>
    </tr>
    <tr>
      <td colspan="4">${termsHtml}</td>
      <td colspan="3" class="sig"></td>
    </tr>
    ${
      vpo?.remarks
        ? `<tr><td colspan="4"><span class="lbl">REMARKS</span><br/>${esc(vpo.remarks)}</td><td colspan="3" class="lbl">AUTHORISED SIGNATORY</td></tr>`
        : `<tr><td colspan="4"></td><td colspan="3" class="lbl">AUTHORISED SIGNATORY</td></tr>`
    }
  </table>`;
};

// Full standalone document for the print window.
export const buildVpoHtml = (vpo) => `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${esc(vpo?.vpo_number || 'Purchase Order')}</title>
<style>${VPO_STYLES}${PRINT_STYLES}</style>
</head>
<body>
  <div class="vpo-doc">${buildVpoBody(vpo)}</div>
  <div class="no-print" style="margin:18px 0 4px; text-align:center;">
    <button onclick="window.print()" style="padding:10px 28px; font-size:14px; font-weight:600; color:#fff; background:#f94d00; border:0; border-radius:6px; cursor:pointer;">Print</button>
  </div>
  <div class="no-print" style="text-align:center; font-size:11px; color:#6b7280;">
    If the colours are missing in the preview, enable “Background graphics” in the print dialog.
  </div>
</body>
</html>`;

const fileNameFor = (vpo) => {
  const base = vpo?.vpo_number || vpo?.ipo_code || 'purchase-order';
  return `${String(base).replace(/[^\w.-]+/g, '-')}.pdf`;
};

// Open the Purchase Order in a standalone window. We deliberately do NOT auto-fire
// window.print(): that stacked the print dialog on top of the freshly-opened document,
// which looked like two popups. The user reviews the coloured document, then hits Print.
export const printVpo = (vpo) => {
  if (!vpo) return;
  const html = buildVpoHtml(vpo);
  const win = window.open('', '_blank', 'width=900,height=1000');
  if (!win) {
    alert('Please allow pop-ups to print the VPO.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
};

// Minimal page reset for the isolated PDF document (A4 width at 96dpi ≈ 794px).
const PDF_RESET = `
html, body { margin: 0; padding: 0; background: #fff; }
body { padding: 18px; width: 794px; }
`;

// Render the document as an A4 PDF and save it.
//
// Why an <iframe> + html2canvas/jsPDF directly (instead of html2pdf.js):
//   • html2canvas cannot parse the `oklch()` colours Tailwind v4 emits, and Tailwind's
//     preflight sets `border-color: oklch(...)` on *every* element. So the document must
//     be rasterised somewhere the app's CSS does not reach — a bare iframe.
//   • html2pdf.js defeats that isolation: it clones the element into an overlay appended
//     to the main document.body, dragging the clone back under Tailwind's preflight. Worse,
//     that overlay is `position: fixed` and is left behind when it throws, which silently
//     blocks every click in the app until a reload.
// html2canvas clones into the element's *own* document, so rendering the iframe's node
// keeps everything isolated and leaves nothing behind.
//
// Both libraries are imported lazily so they stay out of the main bundle.
export const downloadVpoPdf = async (vpo) => {
  if (!vpo) return;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText =
    'position:fixed; left:-10000px; top:0; width:794px; height:1200px; border:0;';
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(
      `<!doctype html><html><head><meta charset="utf-8" />` +
        `<style>${PDF_RESET}${VPO_STYLES}</style></head>` +
        `<body><div class="vpo-doc">${buildVpoBody(vpo)}</div></body></html>`,
    );
    doc.close();

    // Let the iframe lay out before rasterising it.
    await new Promise((resolve) => setTimeout(resolve, 80));

    const target = doc.querySelector('.vpo-doc');
    if (!target) throw new Error('VPO document failed to render.');

    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const margin = 10;
    const usableW = pdf.internal.pageSize.getWidth() - margin * 2;
    const usableH = pdf.internal.pageSize.getHeight() - margin * 2;

    // Height the full canvas would occupy at the PDF's content width.
    const fullH = (canvas.height * usableW) / canvas.width;

    if (fullH <= usableH) {
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.98),
        'JPEG',
        margin,
        margin,
        usableW,
        fullH,
      );
    } else {
      // Taller than one page — slice the canvas into page-sized strips.
      const sliceHeightPx = Math.floor((usableH * canvas.width) / usableW);
      const slice = document.createElement('canvas');
      const ctx = slice.getContext('2d');
      let y = 0;
      let page = 0;

      while (y < canvas.height) {
        const h = Math.min(sliceHeightPx, canvas.height - y);
        slice.width = canvas.width;
        slice.height = h;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);

        if (page > 0) pdf.addPage();
        pdf.addImage(
          slice.toDataURL('image/jpeg', 0.98),
          'JPEG',
          margin,
          margin,
          usableW,
          (h * usableW) / canvas.width,
        );
        y += h;
        page += 1;
      }
    }

    pdf.save(fileNameFor(vpo));
  } finally {
    iframe.remove();
  }
};
