/**
 * Export and Print Utilities for Dubai Finance Tables
 * Supports Copy to clipboard (TSV), CSV/Excel download with UTF-8 BOM, and clean Printable/PDF view.
 */

export interface ExportColumn {
  header: string;
  key: string;
  format?: (row: any, index?: number) => string | number;
}

/**
 * Copies formatted table data to clipboard in Tab-Separated Values (TSV) format
 * Compatible with pasting directly into Excel, Google Sheets, or Notepad.
 */
export async function copyTableToClipboard(
  columns: ExportColumn[],
  data: any[]
): Promise<boolean> {
  try {
    const headerLine = columns.map((c) => c.header).join("\t");
    const rowLines = data.map((row, rIdx) =>
      columns
        .map((c) => {
          const val = c.format ? c.format(row, rIdx) : (row[c.key] ?? "");
          return String(val).replace(/[\t\n\r]/g, " ");
        })
        .join("\t")
    );
    const fullText = [headerLine, ...rowLines].join("\n");
    await navigator.clipboard.writeText(fullText);
    return true;
  } catch (err) {
    console.error("Failed to copy table to clipboard:", err);
    return false;
  }
}

/**
 * Sanitizes CSV cell values to prevent CSV / Spreadsheet formula injection attacks
 * Prefixes dangerous initial characters (=, +, -, @, \t, \r) with a single quote.
 */
export function sanitizeCsvCell(val: string | number | null | undefined): string {
  let str = (val === null || val === undefined ? "" : String(val)).replace(/"/g, '""');
  if (/^[\=\+\-\@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str}"`;
}

/**
 * Generates and downloads a CSV spreadsheet that opens directly in Microsoft Excel.
 * Includes UTF-8 Byte Order Mark (\uFEFF) for proper currency and symbol rendering.
 */
export function exportToExcel(
  filename: string,
  columns: ExportColumn[],
  data: any[]
): void {
  const headers = columns
    .map((c) => sanitizeCsvCell(c.header))
    .join(",");

  const rows = data.map((row, rIdx) =>
    columns
      .map((c) => {
        const val = c.format ? c.format(row, rIdx) : (row[c.key] ?? "");
        return sanitizeCsvCell(val);
      })
      .join(",")
  );

  const csvContent = "\uFEFF" + [headers, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const safeName = filename.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const dateStr = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `${safeName}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens a dedicated printable window with official Dubai Finance letterhead,
 * clean responsive table styles, and automatic print/PDF trigger.
 */
export function printOrExportPdf(
  title: string,
  columns: ExportColumn[],
  data: any[],
  totalText?: string,
  userName?: string
): void {
  const printWindow = window.open("", "_blank", "width=1000,height=750");
  if (!printWindow) {
    window.print();
    return;
  }

  const thHtml = columns
    .map(
      (c) =>
        `<th style="padding: 10px 12px; border: 1px solid #cbd5e1; background: #f8fafc; color: #334155; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${c.header}</th>`
    )
    .join("");

  const trHtml = data
    .map((row, idx) => {
      const tdHtml = columns
        .map((c) => {
          const val = c.format ? c.format(row, idx) : (row[c.key] ?? "");
          return `<td style="padding: 9px 12px; border: 1px solid #e2e8f0; font-size: 12px; color: #1e293b;">${val}</td>`;
        })
        .join("");
      const bg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
      return `<tr style="background: ${bg};">${tdHtml}</tr>`;
    })
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title} - Dubai Finance</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 24px;
            color: #0f172a;
            background: #ffffff;
          }
          .header-bar {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand-title {
            font-size: 22px;
            font-weight: 900;
            color: #d97706;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .report-title {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 4px;
          }
          .meta-info {
            font-size: 11px;
            color: #64748b;
            margin-top: 6px;
          }
          .total-pill {
            background: #ef4444;
            color: #ffffff;
            font-weight: 800;
            font-size: 12px;
            padding: 6px 14px;
            border-radius: 9999px;
            display: inline-block;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            font-size: 10px;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
          }
          @media print {
            body { padding: 0; }
            @page {
              margin: 12mm;
              size: auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="header-bar">
          <div>
            <div class="brand-title">DUBAI FINANCE</div>
            <div class="report-title">${title}</div>
            <div class="meta-info">
              Printed on: ${new Date().toLocaleString()} ${
    userName ? `| Member: <strong>${userName}</strong>` : ""
  }
            </div>
          </div>
          ${
            totalText
              ? `<div><span class="total-pill">${totalText}</span></div>`
              : ""
          }
        </div>

        <table>
          <thead>
            <tr>${thHtml}</tr>
          </thead>
          <tbody>
            ${trHtml || '<tr><td colspan="10" style="padding: 20px; text-align: center; color: #94a3b8;">No records found</td></tr>'}
          </tbody>
        </table>

        <div class="footer">
          <span>Official Dubai Finance System Audit Report</span>
          <span>Confidential • For Account Holder Use Only</span>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 250);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
