import cloudinary from "../config/cloudinary.js";
import puppeteer from "puppeteer";

export const generateReportPDF = async ({
  title,
  content,
  diagnosis,
  prescription,
  followUpDate,
  patient,
  doctor,
  specialty,
  date,
  signatureUrl = "",
}) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #1e293b;
      font-size: 13px;
      line-height: 1.6;
      padding: 40px;
      background: #fff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
      margin-bottom: 24px;
    }
    .brand-name { font-size: 22px; font-weight: 800; color: #1e293b; }
    .brand-name span { color: #2563eb; }
    .report-meta { text-align: right; color: #64748b; font-size: 11px; }
    .report-meta strong { color: #1e293b; font-size: 13px; display: block; margin-bottom: 4px; }
    .patient-doctor-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 16px;
    }
    .info-card h4 {
      color: #2563eb;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .info-card p { color: #374151; margin-bottom: 3px; font-size: 12px; }
    .report-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
    .specialty-badge {
      display: inline-block;
      background: #eff6ff;
      color: #2563eb;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 20px;
      margin-bottom: 20px;
    }
    .section h3 {
      font-size: 13px;
      font-weight: 700;
      border-left: 3px solid #2563eb;
      padding-left: 10px;
      margin-bottom: 10px;
      margin-top: 16px;
    }
    .highlight-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 12px;
    }
    .highlight-box h4 {
      color: #1d4ed8;
      font-weight: 700;
      margin-bottom: 6px;
      font-size: 12px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .signature-section { text-align: right; }
    .signature-img {
      max-width: 160px;
      max-height: 60px;
      margin-bottom: 4px;
      margin-left: auto;
      display: block;
    }
    .signature-line {
      border-top: 1px solid #94a3b8;
      width: 160px;
      margin-left: auto;
      margin-bottom: 4px;
    }
    .footer-note { font-size: 10px; color: #94a3b8; max-width: 300px; }
    .expiry-notice {
      background: #fef3c7;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 10px;
      color: #92400e;
      margin-top: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-name">Med<span>ora</span></div>
      <div style="font-size:10px;color:#64748b;margin-top:2px;">Healthcare Management Platform</div>
    </div>
    <div class="report-meta">
      <strong>Medical Report</strong>
      Date: ${new Date(date).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })}<br/>
      Report ID: RPT-${Date.now().toString().slice(-6)}
    </div>
  </div>

  <div class="patient-doctor-grid">
    <div class="info-card">
      <h4>Patient Information</h4>
      <p><strong>${patient.name}</strong></p>
      <p>${patient.email || ""}</p>
      <p>Age: <span>${patient.age || "N/A"}</span></p>
      <p>Gender: <span>${patient.gender || "N/A"}</span></p>
      <p>Blood Group: <span>${patient.bloodGroup || "N/A"}</span></p>
    </div>
    <div class="info-card">
      <h4>Consulting Doctor</h4>
      <p><strong>Dr. ${doctor.name}</strong></p>
      <p>Specialty: <span>${specialty.name}</span></p>
      ${doctor.qualifications?.length ? `<p>Qualifications: <span>${doctor.qualifications.join(", ")}</span></p>` : ""}
    </div>
  </div>

  <div class="report-title">${title}</div>
  <div class="specialty-badge">${specialty.name}</div>

  <div class="section">${content}</div>

  ${diagnosis ? `
  <div class="highlight-box">
    <h4>Diagnosis</h4>
    <p>${diagnosis}</p>
  </div>` : ""}

  ${prescription ? `
  <div class="highlight-box">
    <h4>Prescription / Treatment Plan</h4>
    <p>${prescription}</p>
  </div>` : ""}

  ${followUpDate ? `
  <div class="highlight-box">
    <h4>Follow-up Date</h4>
    <p>${new Date(followUpDate).toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    })}</p>
  </div>` : ""}

  <div class="footer">
    <div>
      <p class="footer-note">
        This report was generated by Medora Healthcare Platform.
        For medical emergencies, please call 108 or visit the nearest hospital.
      </p>
      <div class="expiry-notice">
        ⚠️ This report will be automatically deleted after 30 days.
      </div>
    </div>
    <div class="signature-section">
      ${signatureUrl
        ? `<img src="${signatureUrl}" class="signature-img" alt="Doctor Signature" />`
        : `<div class="signature-line"></div>`
      }
      <p style="font-size:12px;font-weight:700;">Dr. ${doctor.name}</p>
      <p style="font-size:11px;color:#64748b;">${specialty.name} Specialist</p>
    </div>
  </div>
</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });

  await browser.close();

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "medora/reports",
        format: "pdf",
        type: "upload",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(pdfBuffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  } catch (err) {
    console.error("Cloudinary delete failed:", err.message);
  }
};