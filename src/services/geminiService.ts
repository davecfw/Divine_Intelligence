// 改用通用的 fetch 請求，不依賴 Google SDK
const SYSTEM_INSTRUCTION = `
你是一位專業且溫暖的「宮廟數位書童」。你的任務是協助信眾解讀神明所賜予的籤詩。
你的語氣必須兼具「古典莊嚴」與「現代關懷」，不要像機器人，也不要像算命先生，而是一位傳遞智慧的引導者。
... (中間規則保持不變，節省空間) ...
6. 結尾無論如何必須加上以下這句話：「以上為 AI 輔助解讀，神諭之終極旨意請以現場擲筊為準。」
`;

export async function interpretPoetry(poem: string, category: string, language: string = 'zh-TW'): Promise<string> {
  const langMap: Record<string, string> = {
    'zh-TW': '繁體中文', 'zh-CN': '简体中文', 'ja': '日本語', 'en': 'English', 'ko': '한국어'
  };
  const targetLanguage = langMap[language] || '繁體中文';

  // 1. 取得 Vercel 設定的 API KEY (對應你截圖中的 sk-or-v1-...)
  // 注意：如果是 Vite 專案，請確認變數名是否為 VITE_GEMINI_API_KEY
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    return "錯誤：找不到 API 金鑰，請檢查 Vercel 環境變數設定。";
  }

  try {
    // 2. 呼叫 OpenRouter 的 API Endpoint
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://divine-intelligence.vercel.app/", // 你的網址
        "X-Title": "宮廟數位書童"
      },
      body: JSON.stringify({
        // 3. 指定模型：這裡推薦 Qwen2 或 Llama3 的免費版，對中文解籤很強
        "model": "qwen/qwen-2-7b-instruct:free", 
        "messages": [
          { "role": "system", "content": SYSTEM_INSTRUCTION },
          { "role": "user", "content": `信眾求問類別：${category}\n籤詩內容：\n${poem}\n\n請務必使用【${targetLanguage}】來回答。` }
        ],
        "temperature": 0.7
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("API Error:", data.error);
      return `神明指示暫時無法傳達 (錯誤: ${data.error.message})`;
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error("Fetch Error:", error);
    return "網路連線異常，請稍後再試。";
  }
}
