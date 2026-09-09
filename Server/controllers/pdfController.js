import PDFDocument from "pdfkit";
import Order from "../models/OrderSchema.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateOrderBillPDF = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (req.query.print === "true" || req.query.mode === "print") {
      return printOrderBillHTML(req, res);
    }

    const order = await Order.findById(orderId)
      .populate({
        path: "productsData.productId",
        select: "name quantityUnit price",
      })
      .populate({
        path: "address",
        model: "Address",
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 36,
      info: {
        Title: `Tax Invoice - INV-MD-${order._id.toString().slice(-6).toUpperCase()}`,
        Author: "Madhur Dairy & Daily Needs",
        Subject: "Official Tax Invoice",
      },
    });

    const formattedDate = new Date(order.createdAt || Date.now())
      .toISOString()
      .split("T")[0];

    const isDownloadParam = req.query.download === "true";
    const disposition = isDownloadParam ? "attachment" : "inline";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename=Invoice_${order._id.toString().slice(-6).toUpperCase()}_${formattedDate}.pdf`
    );

    doc.pipe(res);

    // Exact Design Color Palette
    const primaryBlue = "#1084F6";
    const darkTextColor = "#0F172A";
    const lightTextColor = "#475569";
    const bgHeaderBlue = "#EFF6FF";
    const borderColor = "#BFDBFE";
    const lineDividerColor = "#E2E8F0";

    // 1. HEADER (LOGO + ADDRESS + TAX INVOICE BADGE)
    const logoPath = path.resolve(__dirname, "../../Client/src/assets/logoDarkMode.png");
    const logoBadgePath = path.resolve(__dirname, "../../Client/src/assets/logoBadge.png");

    let hasLogo = false;
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 36, 32, { width: 145 });
        hasLogo = true;
      } else if (fs.existsSync(logoBadgePath)) {
        doc.image(logoBadgePath, 36, 32, { width: 65 });
        hasLogo = true;
      }
    } catch (imgErr) {
      console.warn("PDF Logo render fallback:", imgErr.message);
    }

    if (!hasLogo) {
      doc
        .font("Helvetica-Bold")
        .fontSize(22)
        .fillColor(primaryBlue)
        .text("Madhur Dairy", 36, 32);
    }

    // TAX INVOICE BADGE (RIGHT ALIGNED)
    doc
      .roundedRect(365, 32, 195, 30, 4)
      .fill(primaryBlue);
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#FFFFFF")
      .text("OFFICIAL TAX INVOICE", 365, 41, { width: 195, align: "center" });

    // Company Address Details Under Logo (Start at y = 90)
    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(darkTextColor)
      .text("Madhur Dairy & Daily Needs", 36, 90);

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(lightTextColor)
      .text("Shed no. A-31, Datri Mala, Ambad, MIDC Ambad, Nashik, MH 422010", 36, 102)
      .text("Phone: +91 92091 43657 | Email: contact@madhurdairy.com", 36, 114)
      .text("FSSAI Lic. No: 11521028000452 | GSTIN: 27AABCM1234F1ZB", 36, 126);

    // Top Divider Line
    doc
      .moveTo(36, 142)
      .lineTo(560, 142)
      .strokeColor(lineDividerColor)
      .lineWidth(1)
      .stroke();

    // 2. TWO METADATA CARDS (BILLED TO & INVOICE DETAILS)
    const metaY = 152;
    const addr = order.address || {};
    const customerName = addr.name || order.user?.firstName || "sd";
    const fullAddressStr =
      [
        addr.hno ? `House No. ${addr.hno}` : null,
        addr.streetAddress || addr.address || "HITEC City",
        addr.village ? `Village: ${addr.village}` : null,
        addr.landmark ? `Landmark: ${addr.landmark}` : null,
        addr.city || "Hyderabad",
        addr.district ? `Dist: ${addr.district}` : "Dist: Ranga Reddy",
        addr.state
          ? `${addr.state}${addr.pincode ? ` - ${addr.pincode}` : ""}`
          : addr.pincode || "Telangana.",
      ]
        .filter(Boolean)
        .join(", ") || "HITEC City, Village: HITEC City, Hyderabad, Dist: Ranga Reddy, Telangana.";

    // LEFT CARD: BILLED / DELIVERED TO
    doc
      .roundedRect(36, metaY, 252, 105, 4)
      .strokeColor(borderColor)
      .lineWidth(1)
      .stroke();
    // Header Bar
    doc
      .roundedRect(36, metaY, 252, 24, 4)
      .fill(bgHeaderBlue);
    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(primaryBlue)
      .text("BILLED / DELIVERED TO:", 46, metaY + 7);

    // Content inside left card
    doc
      .font("Helvetica-Bold")
      .fontSize(10.5)
      .fillColor(darkTextColor)
      .text(customerName, 46, metaY + 31);

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(lightTextColor)
      .text(`Phone: ${addr.phone || "9898989898"}`, 46, metaY + 45)
      .text(`Address Type: ${addr.addressType || "Home"}`, 46, metaY + 58)
      .text(
        `Address: ${
          fullAddressStr.length > 75
            ? fullAddressStr.slice(0, 75) + "..."
            : fullAddressStr
        }`,
        46,
        metaY + 71,
        { width: 232 }
      );

    // RIGHT CARD: INVOICE & ORDER DETAILS
    const orderIdDisplay = order._id.toString().slice(-6).toUpperCase();
    const orderDateStr = new Date(
      order.createdAt || Date.now()
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    doc
      .roundedRect(308, metaY, 252, 105, 4)
      .strokeColor(borderColor)
      .lineWidth(1)
      .stroke();
    // Header Bar
    doc
      .roundedRect(308, metaY, 252, 24, 4)
      .fill(bgHeaderBlue);
    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(primaryBlue)
      .text("INVOICE & ORDER DETAILS:", 318, metaY + 7);

    // Key Value Table inside right card
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(lightTextColor)
      .text("Invoice No. :", 318, metaY + 31)
      .font("Helvetica-Bold")
      .fillColor(darkTextColor)
      .text(`INV-MD-${orderIdDisplay}`, 405, metaY + 31);

    doc
      .font("Helvetica")
      .fillColor(lightTextColor)
      .text("Order ID :", 318, metaY + 45)
      .font("Helvetica-Bold")
      .fillColor(darkTextColor)
      .text(`${order.orderId || `MD-ORD-260907-${orderIdDisplay}`}`, 405, metaY + 45);

    doc
      .font("Helvetica")
      .fillColor(lightTextColor)
      .text("Order Date :", 318, metaY + 58)
      .font("Helvetica")
      .fillColor(darkTextColor)
      .text(`${orderDateStr}`, 405, metaY + 58);

    doc
      .font("Helvetica")
      .fillColor(lightTextColor)
      .text("Payment Mode :", 318, metaY + 71)
      .font("Helvetica-Bold")
      .fillColor(darkTextColor)
      .text(
        `${order.paymentMode || "Cash on Delivery"} (${
          order.paymentMode === "Online" ? "PAID" : "COD"
        })`,
        405,
        metaY + 71
      );

    doc
      .font("Helvetica")
      .fillColor(lightTextColor)
      .text("Order Status :", 318, metaY + 84)
      .font("Helvetica-Bold")
      .fillColor(order.status === "Delivered" ? "#16A34A" : primaryBlue)
      .text(`${order.status === "Out for Delivery" ? "Ready to Deliver" : order.status || "Delivered"}`, 405, metaY + 84);

    // 3. PRODUCTS TABLE
    let tableTop = 272;
    const colX = {
      no: 36,
      name: 65,
      qty: 320,
      price: 380,
      total: 470,
    };

    // Table Header
    const tableHeaderH = 24;
    doc
      .rect(36, tableTop, 524, tableHeaderH)
      .fill(primaryBlue);

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#FFFFFF")
      .text("#", colX.no + 5, tableTop + 7)
      .text("ITEM DESCRIPTION", colX.name, tableTop + 7)
      .text("QTY", colX.qty, tableTop + 7, { width: 50, align: "center" })
      .text("PRICE (INR)", colX.price, tableTop + 7, { width: 80, align: "right" })
      .text("TOTAL (INR)", colX.total, tableTop + 7, { width: 80, align: "right" });

    let currentY = tableTop + tableHeaderH;
    let grandTotal = 0;

    (order.productsData || []).forEach((item, index) => {
      const p = item.productId;
      const quantity = item.productQuantity || 1;
      const price = item.productPrice || p?.price || 0;
      const itemSubtotal = price * quantity;
      grandTotal += itemSubtotal;

      const productName = p?.name || item?.productName || "Madhur Dairy Product";
      const unit = p?.quantityUnit || "Pack";

      // Cell border
      doc
        .rect(36, currentY, 524, 24)
        .strokeColor(borderColor)
        .lineWidth(0.5)
        .stroke();

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(lightTextColor)
        .text((index + 1).toString(), colX.no + 5, currentY + 7)
        .font("Helvetica-Bold")
        .fillColor(darkTextColor)
        .text(`${productName} (${unit})`, colX.name, currentY + 7, { width: 240 })
        .font("Helvetica")
        .text(quantity.toString(), colX.qty, currentY + 7, { width: 50, align: "center" })
        .text(`INR ${price.toFixed(2)}`, colX.price, currentY + 7, { width: 80, align: "right" })
        .font("Helvetica-Bold")
        .text(`INR ${itemSubtotal.toFixed(2)}`, colX.total, currentY + 7, { width: 80, align: "right" });

      currentY += 24;
    });

    if (!order.productsData || order.productsData.length === 0) {
      grandTotal = order.totalAmount || 0;
    } else if (order.totalAmount && Math.abs(order.totalAmount - grandTotal) > 1) {
      grandTotal = order.totalAmount;
    }

    // 4. TOTALS SUMMARY (RIGHT ALIGNED)
    const summaryY = currentY + 16;
    const totalBoxX = 350;

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(lightTextColor)
      .text("Subtotal:", totalBoxX, summaryY, { width: 100, align: "left" })
      .font("Helvetica-Bold")
      .fillColor(darkTextColor)
      .text(`INR ${grandTotal.toFixed(2)}`, totalBoxX + 90, summaryY, { width: 120, align: "right" });

    doc
      .font("Helvetica")
      .fillColor(lightTextColor)
      .text("Cold-Chain Delivery:", totalBoxX, summaryY + 16, { width: 100, align: "left" })
      .font("Helvetica-Bold")
      .fillColor(lightTextColor)
      .text("FREE", totalBoxX + 90, summaryY + 16, { width: 120, align: "right" });

    doc
      .font("Helvetica")
      .fillColor(lightTextColor)
      .text("GST / Taxes:", totalBoxX, summaryY + 32, { width: 100, align: "left" })
      .font("Helvetica-Bold")
      .fillColor(lightTextColor)
      .text("Included", totalBoxX + 90, summaryY + 32, { width: 120, align: "right" });

    // GRAND TOTAL BLUE BOX
    doc
      .roundedRect(totalBoxX - 6, summaryY + 50, 216, 26, 3)
      .fill(primaryBlue);

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#FFFFFF")
      .text("TOTAL AMOUNT:", totalBoxX, summaryY + 57, { width: 105, align: "left" })
      .text(`INR ${grandTotal.toFixed(2)}`, totalBoxX + 85, summaryY + 57, { width: 120, align: "right" });

    // 5. SIGNATURE & STAMP BLOCK (LEFT ALIGNED)
    const signY = summaryY + 90;

    // Cursive Signature (Left Aligned)
    doc
      .font("Helvetica-BoldOblique")
      .fontSize(20)
      .fillColor("#0F2742")
      .text("Madhur Dairy", 36, signY, { align: "left", width: 170 });

    // Circular Stamp Vector Graphics (Left Aligned)
    const stampCx = 90;
    const stampCy = signY + 65;
    const stampR = 30;

    doc
      .circle(stampCx, stampCy, stampR)
      .lineWidth(1.5)
      .strokeColor(primaryBlue)
      .stroke();

    doc
      .circle(stampCx, stampCy, stampR - 4)
      .lineWidth(0.8)
      .strokeColor(primaryBlue)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(5.5)
      .fillColor(primaryBlue)
      .text("★ MADHUR DAIRY ★", stampCx - 25, stampCy - 20, { width: 50, align: "center" })
      .text("& DAILY NEEDS", stampCx - 25, stampCy + 14, { width: 50, align: "center" });

    // 6. TERMS & CONDITIONS SINGLE LINE
    const termsY = signY + 115;
    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(primaryBlue)
      .text("Terms & Conditions: ", 36, termsY, { continued: true })
      .font("Helvetica-Oblique")
      .fillColor(lightTextColor)
      .text("All products are packed under 4°C cold-chain standards. Please check seals upon delivery. For queries or returns, contact support within 2 hours of delivery.", { width: 524 });

    // 7. DECORATIVE HEART/SPARKLE DIVIDER
    const decY = termsY + 28;
    doc
      .moveTo(36, decY)
      .lineTo(265, decY)
      .strokeColor(borderColor)
      .lineWidth(1)
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(primaryBlue)
      .text("♡", 290, decY - 5, { width: 20, align: "center" });

    doc
      .moveTo(335, decY)
      .lineTo(560, decY)
      .strokeColor(borderColor)
      .lineWidth(1)
      .stroke();

    // 8. FOOTER TEXT
    doc
      .font("Helvetica-BoldOblique")
      .fontSize(9)
      .fillColor(lightTextColor)
      .text(
        "Thank you for choosing Madhur Dairy & Daily Needs for your family's health!",
        36,
        decY + 16,
        { align: "center" }
      )
      .font("Helvetica-Oblique")
      .fontSize(8)
      .text(
        "This is a computer-generated tax invoice. No physical signature is required.",
        36,
        decY + 30,
        { align: "center" }
      );

    doc.end();
  } catch (error) {
    console.error("generateOrderBillPDF error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate order PDF bill." });
    }
  }
};

export const printOrderBillHTML = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate({
        path: "productsData.productId",
        select: "name quantityUnit price",
      })
      .populate({
        path: "address",
        model: "Address",
      });

    if (!order) {
      return res.status(404).send("<h2>Order not found</h2>");
    }

    const orderIdDisplay = order._id.toString().slice(-6).toUpperCase();
    const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const addr = order.address || {};
    const customerName = addr.name || order.user?.firstName || "sd";
    const fullAddressStr =
      [
        addr.hno ? `House No. ${addr.hno}` : null,
        addr.streetAddress || addr.address || "HITEC City",
        addr.village ? `Village: ${addr.village}` : null,
        addr.landmark ? `Landmark: ${addr.landmark}` : null,
        addr.city || "Hyderabad",
        addr.district ? `Dist: ${addr.district}` : "Dist: Ranga Reddy",
        addr.state
          ? `${addr.state}${addr.pincode ? ` - ${addr.pincode}` : ""}`
          : addr.pincode || "Telangana.",
      ]
        .filter(Boolean)
        .join(", ") || "HITEC City, Village: HITEC City, Hyderabad, Dist: Ranga Reddy, Telangana.";

    let grandTotal = 0;
    const productRows = (order.productsData || []).map((item, index) => {
      const p = item.productId;
      const quantity = item.productQuantity || 1;
      const price = item.productPrice || p?.price || 0;
      const itemSubtotal = price * quantity;
      grandTotal += itemSubtotal;
      const productName = p?.name || item?.productName || "Madhur Dairy Product";
      const unit = p?.quantityUnit || "Pack";

      return `
        <tr>
          <td style="border: 1px solid #bfdbfe; padding: 10px 12px; font-weight: bold; color: #475569; text-align: center;">${index + 1}</td>
          <td style="border: 1px solid #bfdbfe; padding: 10px 12px; color: #0f172a; font-weight: 700;">${productName} (${unit})</td>
          <td style="border: 1px solid #bfdbfe; padding: 10px 12px; text-align: center; color: #0f172a; font-weight: bold;">${quantity}</td>
          <td style="border: 1px solid #bfdbfe; padding: 10px 12px; text-align: right; color: #0f172a;">INR ${price.toFixed(2)}</td>
          <td style="border: 1px solid #bfdbfe; padding: 10px 12px; text-align: right; font-weight: bold; color: #0f172a;">INR ${itemSubtotal.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    const logoPath = path.resolve(__dirname, "../../Client/src/assets/logoDarkMode.png");
    let logoBase64 = "";
    try {
      if (fs.existsSync(logoPath)) {
        const logoBuf = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${logoBuf.toString("base64")}`;
      }
    } catch (err) {
      console.warn("Logo base64 error:", err.message);
    }

    if (!order.productsData || order.productsData.length === 0) {
      grandTotal = order.totalAmount || 0;
    } else if (order.totalAmount && Math.abs(order.totalAmount - grandTotal) > 1) {
      grandTotal = order.totalAmount;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice - INV-MD-${orderIdDisplay}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #f1f5f9; color: #0f172a; padding: 20px; }
    .no-print-bar {
      max-width: 800px;
      margin: 0 auto 16px auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      border: none;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-primary { background-color: #1084F6; color: #ffffff; }
    .btn-primary:hover { background-color: #0d6efd; }
    .btn-secondary { background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
    .btn-secondary:hover { background-color: #e2e8f0; }
    
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px 40px;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .badge-tax { background: #1084F6; color: #ffffff; padding: 8px 20px; border-radius: 6px; font-weight: 800; font-size: 13px; letter-spacing: 0.5px; }
    
    .company-info { font-size: 11px; color: #475569; line-height: 1.6; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 14px; }
    
    .grid-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .meta-card { border: 1px solid #bfdbfe; border-radius: 6px; overflow: hidden; }
    .meta-card-header { background: #eff6ff; padding: 8px 14px; font-weight: 800; color: #1084F6; font-size: 11px; letter-spacing: 0.5px; border-bottom: 1px solid #bfdbfe; }
    .meta-card-body { padding: 14px; font-size: 12px; line-height: 1.6; color: #475569; }
    .meta-bold { font-weight: 700; color: #0f172a; }

    .key-value-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .key-label { color: #475569; font-weight: 500; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
    th { background: #1084F6; color: #ffffff; text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; }
    
    .footer-section { display: flex; justify-content: flex-end; margin-bottom: 20px; }
    .totals-box { width: 260px; font-size: 12px; color: #475569; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .total-grand-box { background: #1084F6; color: #ffffff; font-weight: 800; font-size: 14px; padding: 10px 14px; border-radius: 4px; margin-top: 8px; display: flex; justify-content: space-between; }
    
    .signature-area { display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 24px; }
    .signature-text { font-family: 'Dancing Script', cursive; font-size: 28px; font-weight: 700; color: #0F2742; margin-bottom: 6px; }
    
    .terms-text { font-size: 10.5px; color: #475569; margin-bottom: 20px; line-height: 1.5; }
    .terms-bold { font-weight: 800; color: #1084F6; }

    .divider-heart { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px; }
    .divider-line { flex: 1; height: 1px; background-color: #bfdbfe; }
    .heart-icon { color: #1084F6; font-size: 14px; }
    
    .notice-text { text-align: center; font-size: 11px; color: #475569; font-weight: 700; font-style: italic; line-height: 1.5; }
    
    @media print {
      body { background-color: #ffffff; padding: 0; }
      .no-print-bar { display: none !important; }
      .invoice-card { box-shadow: none; border: none; padding: 0; max-width: 100%; }
      @page { size: A4; margin: 12mm; }
    }
  </style>
</head>
<body>

  <div class="no-print-bar">
    <div>
      <strong style="color: #0f172a; font-size: 14px;">Tax Invoice — INV-MD-${orderIdDisplay}</strong>
      <p style="font-size: 11px; color: #64748b; margin-top: 2px;">Click "Print / Save as PDF" to print or save, or "Direct Download" for PDF document.</p>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" class="btn btn-primary">🖨️ Print / Save as PDF</button>
      <a href="/pdf/generate-bill/${order._id}?download=true" class="btn btn-secondary">📥 Direct Download</a>
    </div>
  </div>

  <div class="invoice-card">
    <div class="header-row">
      <div>
        ${
          logoBase64
            ? `<img src="${logoBase64}" alt="Madhur Dairy Logo" style="height: 64px; width: auto; object-fit: contain; display: block; margin-bottom: 2px;" />`
            : `<div style="font-size: 24px; font-weight: 900; color: #0F172A;">Madhur Dairy & Daily Needs</div>`
        }
      </div>
      <div class="badge-tax">OFFICIAL TAX INVOICE</div>
    </div>

    <div class="company-info">
      Shed no. A-31, Datri Mala, Ambad, MIDC Ambad, Nashik, MH 422010<br>
      Phone: +91 92091 43657 | Email: contact@madhurdairy.com<br>
      FSSAI Lic. No: 11521028000452 | GSTIN: 27AABCM1234F1ZB
    </div>

    <div class="grid-meta">
      <div class="meta-card">
        <div class="meta-card-header">BILLED / DELIVERED TO:</div>
        <div class="meta-card-body">
          <div class="meta-bold" style="font-size: 13px; margin-bottom: 4px;">${customerName}</div>
          <div>Phone: ${addr.phone || "9898989898"}</div>
          <div>Address Type: ${addr.addressType || "Home"}</div>
          <div>Address: ${fullAddressStr}</div>
        </div>
      </div>

      <div class="meta-card">
        <div class="meta-card-header">INVOICE & ORDER DETAILS:</div>
        <div class="meta-card-body">
          <div class="key-value-row"><span class="key-label">Invoice No. :</span> <span class="meta-bold">INV-MD-${orderIdDisplay}</span></div>
          <div class="key-value-row"><span class="key-label">Order ID :</span> <span class="meta-bold">${order.orderId || `MD-ORD-260907-${orderIdDisplay}`}</span></div>
          <div class="key-value-row"><span class="key-label">Order Date :</span> <span>${formattedDate}</span></div>
          <div class="key-value-row"><span class="key-label">Payment Mode :</span> <span class="meta-bold">${order.paymentMode || "Cash on Delivery (COD)"}</span></div>
          <div class="key-value-row"><span class="key-label">Order Status :</span> <span style="color: #15803d; font-weight: 800;">${order.status || "Delivered"}</span></div>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th>ITEM DESCRIPTION</th>
          <th style="width: 60px; text-align: center;">QTY</th>
          <th style="width: 110px; text-align: right;">PRICE (INR)</th>
          <th style="width: 120px; text-align: right;">TOTAL (INR)</th>
        </tr>
      </thead>
      <tbody>
        ${productRows}
      </tbody>
    </table>

    <div class="footer-section">
      <div class="totals-box">
        <div class="totals-row"><span>Subtotal:</span><span>INR ${grandTotal.toFixed(2)}</span></div>
        <div class="totals-row"><span>Cold-Chain Delivery:</span><span style="font-weight: 700; color: #475569;">FREE</span></div>
        <div class="totals-row"><span>GST / Taxes:</span><span style="font-weight: 700; color: #475569;">Included</span></div>
        <div class="total-grand-box">
          <span>TOTAL AMOUNT:</span>
          <span>INR ${grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="signature-area">
      <div style="text-align: left; display: flex; flex-direction: column; align-items: flex-start;">
        <div class="signature-text">Madhur Dairy</div>
        <div style="position: relative; width: 68px; height: 68px; display: flex; align-items: center; justify-content: center; margin-top: 4px;">
          <svg width="68" height="68" viewBox="0 0 100 100" style="position: absolute; inset: 0;">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#1084F6" stroke-width="2.5"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1084F6" stroke-width="1.2"/>
            <path id="stampTextTop" d="M 12 50 A 38 38 0 0 1 88 50" fill="none" />
            <text font-size="7.5" font-weight="900" fill="#1084F6">
              <textPath href="#stampTextTop" startOffset="50%" text-anchor="middle">★ MADHUR DAIRY ★</textPath>
            </text>
            <path id="stampTextBot" d="M 88 50 A 38 38 0 0 1 12 50" fill="none" />
            <text font-size="7" font-weight="800" fill="#1084F6">
              <textPath href="#stampTextBot" startOffset="50%" text-anchor="middle">& DAILY NEEDS</textPath>
            </text>
          </svg>
          ${logoBase64 ? `<img src="${logoBase64}" style="height: 26px; width: auto; object-fit: contain; margin-top: 2px;" />` : `<div style="font-weight:900; color:#1084F6; font-size:10px;">MD</div>`}
        </div>
      </div>
    </div>

    <div class="terms-text">
      <span class="terms-bold">Terms & Conditions:</span> <em>All products are packed under 4°C cold-chain standards. Please check seals upon delivery. For queries or returns, contact support within 2 hours of delivery.</em>
    </div>

    <div class="divider-heart">
      <div class="divider-line"></div>
      <div class="heart-icon">♡</div>
      <div class="divider-line"></div>
    </div>

    <div class="notice-text">
      Thank you for choosing Madhur Dairy & Daily Needs for your family's health!<br>
      <span style="font-size: 10px; font-weight: 500;">This is a computer-generated tax invoice. No physical signature is required.</span>
    </div>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    return res.send(html);
  } catch (err) {
    console.error("printOrderBillHTML error:", err);
    return res.status(500).send("Failed to load invoice print page.");
  }
};
