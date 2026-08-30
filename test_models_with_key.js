import { GoogleGenAI } from "@google/genai";

const apiKey = "AQ.Ab8RN6It436iO2ka4wBGVcX58fk4joCtDaNJcCFP4nt_H2Ix3Q";
const ai = new GoogleGenAI({ apiKey });

const models = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-3.1-pro-preview"];

(async () => {
  for (const m of models) {
    try {
      const response = await ai.models.generateContent({
        model: m,
        contents: "Test OCR / Text extraction. Reply with 'READY'."
      });
      console.log(`Model ${m} SUCCESS:`, response.text.trim());
    } catch (err) {
      console.log(`Model ${m} FAILED:`, err.message);
    }
  }
})();
