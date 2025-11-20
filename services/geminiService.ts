import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, JobMatchResult, JobSearchFilters } from "../types";
import {
  SYSTEM_INSTRUCTION_INTERVIEW,
  SYSTEM_INSTRUCTION_RESUME,
} from "../constants";

// Initialize the Gemini API client
// Use import.meta.env for Vite, fallback to process.env if needed
const apiKey =
  (import.meta as any).env?.VITE_GOOGLE_API_KEY || process.env.API_KEY;
if (!apiKey) {
  console.error(
    "Missing Google API Key. Please set VITE_GOOGLE_API_KEY in your .env file.",
  );
}
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const MODEL_FAST = "gemini-2.5-flash";

/**
 * Analyzes a resume (text or PDF base64) and provides structured feedback + ATS Score + Rewritten version.
 */
export const analyzeResume = async (content: {
  text?: string;
  base64?: string;
  mimeType?: string;
}): Promise<AnalysisResult> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      atsScore: {
        type: Type.NUMBER,
        description:
          "A score from 0 to 100 indicating ATS parseability and keyword optimization.",
      },
      summary: {
        type: Type.STRING,
        description: "A 2-sentence executive summary of the resume quality.",
      },
      strengths: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of 3-5 strong points.",
      },
      weaknesses: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of 3-5 weak points.",
      },
      improvements: {
        type: Type.STRING,
        description: "Detailed paragraph on how to improve the resume.",
      },
      rewrittenResume: {
        type: Type.STRING,
        description:
          "A rewritten version of the resume (or key sections) incorporating the improvements to increase the ATS score. Use markdown formatting.",
      },
    },
    required: [
      "atsScore",
      "summary",
      "strengths",
      "weaknesses",
      "improvements",
      "rewrittenResume",
    ],
  };

  let parts: any[] = [];

  if (content.base64 && content.mimeType) {
    parts = [
      {
        inlineData: {
          mimeType: content.mimeType,
          data: content.base64,
        },
      },
      {
        text: "Analyze this resume. Provide an ATS score, feedback, and a rewritten improved version.",
      },
    ];
  } else if (content.text) {
    parts = [
      {
        text: `Analyze this resume and provide an improved version:\n\n${content.text}`,
      },
    ];
  } else {
    throw new Error("No content provided");
  }

  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_RESUME,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text) as AnalysisResult;
};

/**
 * Matches a resume against a job description.
 */
export const matchJob = async (
  resume: { text?: string; base64?: string },
  jobDescription: string,
): Promise<JobMatchResult> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      matchScore: {
        type: Type.NUMBER,
        description: "A score from 0 to 100 indicating fit.",
      },
      jobTitle: {
        type: Type.STRING,
        description:
          "Extract the Job Title from the description. If not found, guess based on context.",
      },
      company: {
        type: Type.STRING,
        description:
          "Extract the Company Name from the description. If not found, return 'Unknown Company'.",
      },
      missingKeywords: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Keywords found in JD but missing in Resume.",
      },
      analysis: { type: Type.STRING, description: "Explanation of the score." },
      culturalFit: {
        type: Type.STRING,
        description: "Assessment of soft skills alignment.",
      },
    },
    required: [
      "matchScore",
      "jobTitle",
      "company",
      "missingKeywords",
      "analysis",
      "culturalFit",
    ],
  };

  let parts: any[] = [];
  const promptText = `
    Job Description:
    ${jobDescription}

    Compare the provided resume to the job description above.
    Provide a match score, analysis of gaps, and identify missing keywords.
  `;

  if (resume.base64) {
    parts = [
      {
        inlineData: {
          mimeType: "application/pdf",
          data: resume.base64,
        },
      },
      { text: promptText },
    ];
  } else if (resume.text) {
    parts = [{ text: `Resume Text:\n${resume.text}\n\n${promptText}` }];
  } else {
    throw new Error("No resume content provided");
  }

  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text) as JobMatchResult;
};

/**
 * Finds jobs using Google Search Grounding.
 */
export const findJobs = async (
  query: string,
  userContext: { text?: string; base64?: string },
  useResumeForQuery: boolean = false,
  filters?: JobSearchFilters,
) => {
  const filterInstructions = filters
    ? `
    Apply the following filters to the search results if possible:
    ${filters.datePosted !== "any" ? `- Date Posted: ${filters.datePosted}` : ""}
    ${filters.experienceLevel !== "any" ? `- Experience Level: ${filters.experienceLevel}` : ""}
    ${filters.minSalary !== "any" ? `- Minimum Salary: ${filters.minSalary}` : ""}
  `
    : "";

  let parts: any[] = [];

  if (useResumeForQuery) {
    const promptText = `
      I am a job seeker with the profile provided in the attached document (resume).

      1. First, analyze the resume to identify the most suitable job titles, skills, and industries.
      2. Then, use the Google Search tool to find 5-7 active, real job listings that match this profile.
      ${filterInstructions}

      For each job, provide the Job Title, Company Name, and a brief snippet of why it's a match based on my resume.
      You MUST use the Google Search tool.
    `;

    if (userContext.base64) {
      // Multimodal input: PDF + Text Prompt
      parts = [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: userContext.base64,
          },
        },
        { text: promptText },
      ];
    } else {
      // Text only fallback
      parts = [
        { text: `My Resume Summary: ${userContext.text || "Not provided"}` },
        { text: promptText },
      ];
    }
  } else {
    // Manual Search
    parts = [
      {
        text: `
      Please search for active job listings for: "${query}".
      ${filterInstructions}

      Return a list of 5-7 relevant job openings found on the web.
      For each job, provide the Job Title, Company Name, and a brief snippet of why it's a match.
      You MUST use the Google Search tool to find real, current listings.
      `,
      },
    ];
  }

  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: { parts },
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  if (!response.text) {
    throw new Error(
      "No search results generated. API might be blocked or returned empty.",
    );
  }

  return {
    text: response.text,
    groundingChunks:
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
  };
};

/**
 * Creates a chat session for the interview coach.
 */
export const createInterviewSession = (role: string) => {
  const chat = ai.chats.create({
    model: MODEL_FAST,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_INTERVIEW,
    },
  });

  chat.sendMessage({
    message: `I am applying for the role of ${role}. Please start the interview.`,
  });

  return chat;
};
