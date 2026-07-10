// Printable Vendor Purchase Order (VPO) document.
//
// Renders an issued VPO into the company's Purchase Order format (see the
// "PURCHASE ORDER" template) inside a fresh browser window and triggers print.
// A standalone window is used (instead of an in-app overlay) so the printout is
// pixel-clean and never inherits the dashboard's styles.

// Company header — fixed for Creative Home Decor LLP. These live only on the
// printed document today, so they're defined here as constants.
const COMPANY = {
  name: 'CREATIVE HOME DECOR LLP',
  address:
    'KHASRA # 54-9, 2-13 NEAR POWER HOUSE, VPO BRAHMAN MAJRA, PANIPAT, HARYANA (132103)',
  gst: '06AAUFC6113C1ZO',
  email: 'info@creativehomedecorsllp.com',
};

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

// Build the HTML for one VPO. `vpo` is the detail object returned by
// getVpoDetail (VPOSerializer shape).
export const buildVpoHtml = (vpo) => {
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
    .map(
      () =>
        '<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
    )
    .join('');

  const totalAmount =
    vpo?.total_amount !== undefined && vpo?.total_amount !== null && vpo?.total_amount !== ''
      ? fmtMoney(vpo.total_amount)
      : fmtMoney(
          lines.reduce(
            (s, l) => s + (l.amount ? Number(l.amount) : 0),
            0
          )
        );

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${esc(vpo?.vpo_number || 'Purchase Order')}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; padding: 16px; font-size: 12px; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #000; padding: 3px 6px; vertical-align: top; }
  .title { text-align: center; font-weight: bold; font-size: 14px; letter-spacing: 1px; }
  .c { text-align: center; }
  .r { text-align: right; }
  .b { font-weight: bold; }
  .no-border td { border: none; }
  .muted { color: #333; }
  .items th { background: #d9d9d9; text-align: center; font-weight: bold; }
  .label { white-space: nowrap; }
  @media print { body { padding: 0; } .no-print { display: none; } }
</style>
</head>
<body>
  <table>
    <tr><td colspan="7" class="title">PURCHASE ORDER</td></tr>
    <tr>
      <td colspan="4" class="b">FROM: ${esc(COMPANY.name)}</td>
      <td colspan="3" class="b r">TO: ${esc(vpo?.vendor_name || 'VENDOR (VENDOR CODE)')}</td>
    </tr>
    <tr>
      <td colspan="4">${esc(COMPANY.address)}</td>
      <td colspan="3">${esc(vpo?.vendor_address || '')}</td>
    </tr>
    <tr>
      <td colspan="1" class="b label">GST:</td>
      <td colspan="3">${esc(COMPANY.gst)}</td>
      <td colspan="1" class="b r label">GST:</td>
      <td colspan="2">${esc(vpo?.vendor_gst || '')}</td>
    </tr>
    <tr>
      <td colspan="1" class="b label">EMAIL:</td>
      <td colspan="3">${esc(COMPANY.email)}</td>
      <td colspan="1" class="b r label">CONTACT PERSON:</td>
      <td colspan="2">${esc(vpo?.vendor_contact_person || '')}</td>
    </tr>
    <tr>
      <td colspan="1" class="b label">IPO CODE:</td>
      <td colspan="3">${esc(vpo?.ipo_code || '')}</td>
      <td colspan="1" class="b r label">WHATSAPP NO.:</td>
      <td colspan="2">${esc(vpo?.vendor_whatsapp || '')}</td>
    </tr>
    <tr>
      <td colspan="1" class="b label">VPO NO:</td>
      <td colspan="3">${esc(vpo?.vpo_number || '')}</td>
      <td colspan="1" class="b r label">EMAIL:</td>
      <td colspan="2">${esc(vpo?.vendor_email || '')}</td>
    </tr>
    <tr>
      <td colspan="1" class="b label">VPO DATE:</td>
      <td colspan="3">${esc(fmtDate(vpo?.issued_at || vpo?.created_at))}</td>
      <td colspan="1" class="b r label">DELIVERY DUE DATE:</td>
      <td colspan="2">${esc(fmtDate(vpo?.delivery_due_date))}</td>
    </tr>
    <tr>
      <td colspan="4"></td>
      <td colspan="1" class="b r label">PAYMENT TERMS:</td>
      <td colspan="2">${esc(vpo?.payment_terms || '')}</td>
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
      <tr>
        <td colspan="5" class="r b">TOTAL</td>
        <td class="r b">${esc(totalAmount)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <table style="margin-top:-1px;">
    <tr>
      <td colspan="4" style="height:52px;">
        <span class="b">RAISED BY:</span><br/>
        <span>${esc(vpo?.raised_by_name || '')}</span><br/>
        <span class="muted">${esc(vpo?.raised_by_username || '')}</span>
      </td>
      <td colspan="3" class="b">FOR ${esc(COMPANY.name)}</td>
    </tr>
    <tr>
      <td colspan="4" class="b">TERMS &amp; CONDITIONS</td>
      <td colspan="3"></td>
    </tr>
    <tr>
      <td colspan="4"><em>BILL SUBMISSION AGAINST GOODS RECEIPT NOTE ONLY</em></td>
      <td colspan="3"></td>
    </tr>
    <tr>
      <td colspan="4"><em>NOTE: GOODS WILL BE ACCEPTED ONLY UNDER POLYWRAPPED CONDITION.</em></td>
      <td colspan="3" class="b">AUTHORISED SIGNATORY</td>
    </tr>
    ${vpo?.remarks ? `<tr><td colspan="7"><span class="b">REMARKS:</span> ${esc(vpo.remarks)}</td></tr>` : ''}
  </table>

  <div class="no-print" style="margin-top:16px; text-align:center;">
    <button onclick="window.print()" style="padding:8px 20px; font-size:14px; cursor:pointer;">Print</button>
  </div>
</body>
</html>`;
};

// Open a print window for the given VPO and trigger the browser print dialog.
export const printVpo = (vpo) => {
  if (!vpo) return;
  const html = buildVpoHtml(vpo);
  const win = window.open('', '_blank', 'width=900,height=1000');
  if (!win) {
    // Popup blocked — surface a hint.
    // eslint-disable-next-line no-alert
    alert('Please allow pop-ups to print the VPO.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  // Give the new document a tick to lay out before printing.
  setTimeout(() => {
    try {
      win.print();
    } catch {
      /* user can click the Print button in the window */
    }
  }, 300);
};
