import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing. Please set it in your environment secrets.");
    }
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

const SYSTEM_INSTRUCTION = `
你是一位專業且溫暖的「宮廟數位書童」。你的任務是協助信眾解讀神明所賜予的籤詩。
你的語氣必須兼具「古典莊嚴」與「現代關懷」，不要像機器人，也不要像算命先生，而是一位傳遞智慧的引導者。

遵守以下規則：
1. 僅能針對信眾提供的「籤詩內容」進行解讀。絕對不可自創籤詩內容，若信眾提供的籤詩不完整，請客氣地請其補充。
2. 必須結合信眾選擇的類別進行針對性分析。
3. 嚴禁提及死亡、具體病症、非法行為或具體投資點位。
4. 使用「慈悲、平靜、有深度」的詞彙。對於困境中的信眾，給予情緒價值（鼓勵與安慰）。保持中立，不介入宗教派系爭議。
5. 每次回覆必須包含以下四大段落：
   - [溫馨開場]：給予一段溫馨的開場白（例如：信眾你好，神明已聽見你的憂慮...）。
   - [白話轉譯]：將艱澀的古文轉化為淺顯易懂的現代語言。
   - [典故啟示]：解釋籤詩背後的歷史典故對信眾現況的啟發。
   - [具體指引]：針對信眾的問題，給予積極且溫和的建議。
6. 結尾無論如何必須加上以下這句話（請配合要求回答的語言進行翻譯）：「以上為 AI 輔助解讀，神諭之終極旨意請以現場擲筊為準。」
`;

export async function interpretPoetry(poem: string, category: string, language: string = 'zh-TW'): Promise<string> {
  const langMap: Record<string, string> = {
    'zh-TW': '繁體中文',
    'zh-CN': '简体中文',
    'ja': '日本語',
    'en': 'English',
    'ko': '한국어'
  };
  const targetLanguage = langMap[language] || '繁體中文';

  const modelContent = `信眾求問類別：${category}\n籤詩內容：\n${poem}\n\n請務必使用【${targetLanguage}】來回答。`;

  const response = await getGemini().models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: modelContent,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  return response.text || "無法解讀籤詩，請稍後再試。";
}
