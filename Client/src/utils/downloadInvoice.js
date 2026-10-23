import api, { getBaseUrl } from "../services/api";

/**
 * Downloads an order invoice as a PDF file directly to the client machine using a Blob.
 * This guarantees reliable, cross-browser PDF downloading without pop-up blocking.
 *
 * @param {string} orderId - MongoDB order _id
 * @param {string} [orderDisplayId] - Readable order code e.g. "INV-NMD-A6C3F9"
 * @returns {Promise<boolean>}
 */
export const downloadInvoicePdf = async (orderId, orderDisplayId = "") => {
  if (!orderId) {
    throw new Error("Order ID is required to download invoice.");
  }

  const rawBase = api.defaults.baseURL || getBaseUrl() || "";
  const baseUrl = rawBase.replace(/\/+$/, "");
  const downloadUrl = `${baseUrl}/pdf/generate-bill/${orderId}?download=true`;

  const cleanSuffix = (orderDisplayId || orderId).toString().replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  const filename = `Tax_Invoice_INV-NMD-${cleanSuffix || "ORDER"}.pdf`;

  try {
    const token =
      sessionStorage.getItem("userToken") ||
      localStorage.getItem("userToken") ||
      sessionStorage.getItem("adminToken") ||
      localStorage.getItem("adminToken");

    const headers = {
      Accept: "application/pdf",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-user-token"] = token;
    }

    const response = await fetch(downloadUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const blob = await response.blob();
    const pdfBlob = new Blob([blob], { type: "application/pdf" });

    // 1. Attempt Blob Object URL download (Standard & fastest)
    let downloaded = false;
    try {
      if (window.URL && window.URL.createObjectURL) {
        const blobUrl = window.URL.createObjectURL(pdfBlob);
        const anchor = document.createElement("a");
        anchor.href = blobUrl;
        anchor.download = filename;
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();

        setTimeout(() => {
          try {
            document.body.removeChild(anchor);
            window.URL.revokeObjectURL(blobUrl);
          } catch {
            // ignore
          }
        }, 500);
        downloaded = true;
      }
    } catch (blobErr) {
      console.warn("Blob URL download attempt error:", blobErr);
    }

    if (downloaded) return true;

    // 2. Fallback: Base64 Data URL (Universally supported in all mobile webviews)
    try {
      await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            const dataUrl = reader.result;
            const dataAnchor = document.createElement("a");
            dataAnchor.href = dataUrl;
            dataAnchor.download = filename;
            dataAnchor.style.display = "none";
            document.body.appendChild(dataAnchor);
            dataAnchor.click();
            setTimeout(() => {
              try {
                document.body.removeChild(dataAnchor);
              } catch (_) {}
            }, 500);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });
      return true;
    } catch (dataErr) {
      console.warn("DataURL fallback error:", dataErr);
    }

    // 3. Fallback: Direct window navigation
    window.location.assign(downloadUrl);
    return true;
  } catch (error) {
    console.warn("Direct blob download failed, attempting window fallback:", error);
    // Direct window location navigation
    try {
      window.location.assign(downloadUrl);
    } catch {
      window.open(downloadUrl, "_blank");
    }
    return true;
  }
};

export default downloadInvoicePdf;
