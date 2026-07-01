import Anthropic from "@anthropic-ai/sdk";
import { getSpecialtyPrompt, patientSummaryPrompt } from "../config/ai.config.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

Use <h3> for section headings, <p> for paragraphs, <ul>/<li> for lists. Keep it professional and medically accurate.
`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  return message.content[0].text;
};

// Generate patient-friendly summary
export const generatePatientSummary = async ({
  reportContent,
  patientName,
  specialtyName,
}) => {
  const userMessage = `
Convert this medical report into a simple, patient-friendly summary:

**Report:**
${reportContent}

Please provide a JSON response with exactly this structure (no markdown, just JSON):
{
  "summary": "2-3 paragraph simple explanation of what the report says",
  "precautions": ["precaution 1", "precaution 2", "precaution 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Write for ${patientName}, a patient visiting ${specialtyName}. Use simple language, be reassuring, and focus on what they need to do next.
`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: patientSummaryPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  try {
    const text = message.content[0].text;
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return {
      summary: message.content[0].text,
      precautions: [],
      recommendations: [],
    };
  }
};