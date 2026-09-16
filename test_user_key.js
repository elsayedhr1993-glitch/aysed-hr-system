import { GoogleGenAI } from "@google/genai";

const apiKey = "AQ.Ab8RN6It436iO2ka4wBGVcX58fk4joCtDaNJcCFP4nt_H2Ix3Q";
console.log("Testing with provided key...");

const ai = new GoogleGenAI({ apiKey });

(async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Test connection. Reply with 'OK'."
    });
    console.log("Response with gemini-2.5-flash:", response.text);
  } catch (err) {
    console.log("Error with gemini-2.5-flash:", err.message);
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Test connection. Reply with 'OK'."
    });
    console.log("Response with gemini-1.5-flash:", response.text);
  } catch (err) {
    console.log("Error with gemini-1.5-flash:", err.message);
  }
})();
