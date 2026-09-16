import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getSpecialtyPrompt,
  patientSummaryPrompt,
} from "../config/ai.config.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_NAME = "gemini-3.8-flash";

// Retry Gemini requests when the service is temporarily unavailable
const generateWithRetry = async (model, prompt, maxRetries = 4) => {
  let delay = 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      const status = error?.status || error?.code;

      // Retry only temporary errors
      if (status !== 503 && status !== 429) {
        throw error;
      }

      if (attempt === maxRetries) {
        throw error;
      }

      const jitter = Math.floor(Math.random() * 500);
      const waitTime = delay + jitter;

      console.log(
        `Gemini temporary error (${status}). ` +
        `Retrying in ${waitTime}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, waitTime));

      delay = Math.min(delay * 2, 15000);
    }
  }
};

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

${
  templateContent
    ? `**Template Structure to Follow:**\n${templateContent}`
    : ""
}

Please generate a comprehensive, professional medical report in HTML format with proper sections including:

- Chief Complaint
- History of Present Illness
- Examination Findings
- Diagnosis
- Treatment Plan
- Prescription (if applicable)
- Follow-up Instructions

Use <h3> for section headings, <p> for paragraphs, <ul>/<li> for lists.

Keep it professional and medically accurate.

Do not invent missing clinical facts. Clearly indicate when information is not provided.

Return ONLY the HTML content, no markdown code fences, no explanations.
`;

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
  });

  const result = await generateWithRetry(model, userMessage);

  const response = result.response;

  let text = response.text();

  // Remove markdown code fences if Gemini adds them
  text = text
    .replace(/```html/gi, "")
    .replace(/```/g, "")
    .trim();

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

Please provide a JSON response with EXACTLY this structure:

{
  "summary": "2-3 paragraph simple explanation of what the report says",
  "precautions": ["precaution 1", "precaution 2", "precaution 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Write for ${patientName}, a patient visiting ${specialtyName}.

Use simple language and focus on what the patient needs to understand and do next.

Do not invent medical facts that are not present in the report.

Return ONLY valid JSON.
`;

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
  });

  const result = await generateWithRetry(model, userMessage);

  const response = result.response;

  let text = response.text();

  try {
    const clean = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(clean);
  } catch (error) {
    console.error("Failed to parse Gemini JSON response:", error);

    return {
      summary: text,
      precautions: [],
      recommendations: [],
    };
  }
};