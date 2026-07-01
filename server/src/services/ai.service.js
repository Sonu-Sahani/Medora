import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSpecialtyPrompt, patientSummaryPrompt } from "../config/ai.config.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate AI medical report draft for doctor
export const generateAIReport = async ({
  specialtySlug,
  patientInfo,
  symptoms,
  doctorNotes,
  templateContent = "",
}) => {
  const systemPrompt = getSpecialtyPrompt(specialtySlug);

  const userMessage = `
${systemPrompt}

Generate a professional medical report based on the following information:

**Patient Information:**
- Name: ${patientInfo.name}
- Age: ${patientInfo.age || "Not provided"}
- Gender: ${patientInfo.gender || "Not provided"}
- Blood Group: ${patientInfo.bloodGroup || "Not provided"}

**Chief Complaints / Symptoms:**
${symptoms || "Not provided"}

**Doctor's Notes:**
${doctorNotes || "Not provided"}

${templateContent ? `**Template Structure to Follow:**\n${templateContent}` : ""}

Please generate a comprehensive, professional medical report in HTML format with proper sections including:
- Chief Complaint
- History of Present Illness  
- Examination Findings
- Diagnosis
- Treatment Plan
- Prescription (if applicable)
- Follow-up Instructions

Use <h3> for section headings, <p> for paragraphs, <ul>/<li> for lists. Keep it professional and medically accurate. Return ONLY the HTML content, no markdown code fences, no explanations.
`;

const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const result = await model.generateContent(userMessage);
  const response = result.response;
  let text = response.text();

  // Clean up any markdown code fences Gemini might add
  text = text.replace(/```html|```/g, "").trim();

  return text;
};

// Generate patient-friendly summary
export const generatePatientSummary = async ({
  reportContent,
  patientName,
  specialtyName,
}) => {
  const userMessage = `
${patientSummaryPrompt}

Convert this medical report into a simple, patient-friendly summary:

**Report:**
${reportContent}

Please provide a JSON response with EXACTLY this structure (no markdown, no code fences, just raw JSON):
{
  "summary": "2-3 paragraph simple explanation of what the report says",
  "precautions": ["precaution 1", "precaution 2", "precaution 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Write for ${patientName}, a patient visiting ${specialtyName}. Use simple language, be reassuring, and focus on what they need to do next.
`;

const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const result = await model.generateContent(userMessage);
  const response = result.response;
  let text = response.text();

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return {
      summary: text,
      precautions: [],
      recommendations: [],
    };
  }
};