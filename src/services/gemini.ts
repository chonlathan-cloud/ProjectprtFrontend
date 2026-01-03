
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateFinancialAdvice = async (history: { role: 'user' | 'model', content: string }[]) => {
  const model = 'gemini-3-flash-preview';
  
  const contents = history.map(item => ({
    role: item.role,
    parts: [{ text: item.content }]
  }));

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: `You are a professional financial advisor for PRT Dashboard users. 
        Current user context: 
        - Total Expenses: 34,567 THB
        - Total Income: 45,000 THB
        - Remaining Balance: 10,433 THB
        Latest items include book fees (35,000 THB) and computer repairs (1,700 THB).
        Be helpful, precise, and encourage savings. Respond in Thai where appropriate or as requested.`,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI โปรดลองอีกครั้งในภายหลัง";
  }
};
