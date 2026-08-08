# India Gst

> Generated from `assets.json`. Do not edit by hand.

## GST tax invoices + GSTIN validation + GSTR-1 working papers
🟢 as-is · `commonjs` · runs: server
**Preview:** Not deployed — run it: npm i && npm start, then http://localhost:3000 — place an order, then open its invoice
**Files:** `invoice.js`, `gstin.js`, `gst-return.js`
Legally-shaped Indian GST invoicing, ~800 lines. Prices are GST-INCLUSIVE so tax is extracted from the line total (taxable = total / (1 + rate)), never added on top. Same state as seller → CGST + SGST at half rate each; different state → IGST at full rate, never both. One strictly sequential invoice series with no reuse and no gaps. GSTIN checked on format AND checksum. Plus GSTR-1 working papers pre-summarised into the portal's own tables (B2CS, B2CL, HSN, DOCS) the way a CA actually files.
**Adapting it:** Point it at your own order shape and seller state. The tax maths and the return tables need no changes — they follow statute, not this project.
**Why it exists:** This is the part nobody wants to rewrite and everybody gets subtly wrong. A wrong GSTIN flows into GSTR-1, the buyer's input credit never appears, and someone loses a week on the phone. Extracting tax instead of adding it is the difference between a correct invoice and a 18%-off accident.
**Tags:** gst, gstin, invoice, tax, india, gstr-1, cgst, sgst, igst, compliance, accounting
