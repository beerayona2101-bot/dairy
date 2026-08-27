import PDFDocument from "pdfkit";
import Order from "../models/OrderSchema.js";

export const generateOrderBillPDF = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate({
      path: "productsData.productId",
      select: "name",
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    const formattedDate = new Date(order.createdAt).toISOString().split("T")[0];

    const customerName = order.address?.name || "Customer";

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Bill_${orderId}_${formattedDate}_${customerName}.pdf`
    );

  doc.pipe(res);
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#313131")
    .text("Madhur Dairy & Daily Needs", { align: "center" });

  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("gray")
    .text("Shed no. A-31, Datri Mala, Ambad,", { align: "center" })
    .text("MIDC Ambad, Nashik, Maharashtra 422010", { align: "center" })
    .text("+91 92091 43657 | contact@madhurdairy.com", { align: "center" })
    .moveDown(1.2);

  // Order Metadata
  const createdAtFormatted = new Date(order.createdAt).toLocaleString("en-IN");

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor("#000000")
    .text("Order Summary", { underline: true })
    .moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#000000")
    .text(`Order ID: ${order._id}`)
    .text(`Order Date: ${createdAtFormatted}`)
    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#000000")
      .text(`Order ID: ${order._id}`)
      .text(`Order Date: ${createdAtFormatted}`)
      .text(`Customer: ${order.address?.name || "-"}`)
      .text(`Payment Mode: ${order.paymentMode}`)
      .text(`Order Status: ${order.status}`);

    if (order.paymentMode === "Online" && order.razorpay?.paymentId) {
      doc
        .fontSize(11)
        .fillColor("gray")
        .text(`Razorpay Payment ID: ${order.razorpay.paymentId}`)
        .text(`Razorpay Order ID: ${order.razorpay.orderId}`);
    }

    doc.moveDown(1);

    // Delivery Address
    const addr = order.address || {};
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Delivery Address", { underline: true })
      .moveDown(0.3);

    const fullAddressStr = [
      addr.hno ? `House No. ${addr.hno}` : null,
      addr.streetAddress || addr.address,
      addr.village ? `Village: ${addr.village}` : null,
      addr.landmark ? `Landmark: ${addr.landmark}` : null,
      addr.city,
      addr.district ? `Dist: ${addr.district}` : null,
      addr.state ? `${addr.state}${addr.pincode ? ` - ${addr.pincode}` : ""}` : addr.pincode,
    ].filter(Boolean).join(", ");

    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Name: ${addr.name || "-"}`)
      .text(`Address Type: ${addr.addressType || "-"}`)
      .text(`Phone: ${addr.phone || "-"}`)
      .text(`Address: ${fullAddressStr || "-"}`)
      .moveDown(1);

    // Product Table Header
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Ordered Items", { underline: true })
      .moveDown(0.5);

    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 270;
    const priceX = 340;
    const subtotalX = 440;

    doc
      .fontSize(12)
      .text("Product", itemX, tableTop)
      .text("Qty", qtyX, tableTop, { width: 40, align: "right" })
      .text("Price", priceX, tableTop, { width: 60, align: "right" })
      .text("Subtotal", subtotalX, tableTop, { width: 80, align: "right" });

    doc
      .moveTo(itemX, doc.y + 2)
      .lineTo(550, doc.y + 2)
      .stroke();

    let y = doc.y + 6;
    let grandTotal = 0;

    (order.productsData || []).forEach((item) => {
      const p = item.productId;
      const quantity = item.productQuantity || 1;
      const price = item.productPrice || 0;
      const subtotal = price * quantity;
      grandTotal += subtotal;

      const productName = p?.name || item?.productName || "Madhur Dairy Item";

      doc
        .font("Helvetica")
        .fontSize(11)
        .text(productName, itemX, y)
        .text(quantity.toString(), qtyX, y, { width: 40, align: "right" })
        .text(`₹${price.toFixed(2)}`, priceX, y, { width: 60, align: "right" })
        .text(`₹${subtotal.toFixed(2)}`, subtotalX, y, {
          width: 80,
          align: "right",
        });

      y += 20;
    });

    doc.moveTo(itemX, y).lineTo(550, y).stroke();

    y += 10;
    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(`Grand Total: ₹${grandTotal.toFixed(2)}`, subtotalX, y, {
        width: 80,
        align: "right",
      });

    // Footer
    doc
      .moveDown(3)
      .font("Helvetica-Oblique")
      .fontSize(10)
      .fillColor("gray")
      .text("Thank you for shopping with Madhur Dairy & Daily Needs.", {
        align: "center",
      })
      .text("We look forward to serving you again!", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("generateOrderBillPDF error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate order PDF bill." });
    }
  }
};
