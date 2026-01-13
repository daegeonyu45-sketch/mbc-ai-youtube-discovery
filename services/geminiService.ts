
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const analyzeCommentsAndKeywords = async (videoTitle: string, comments: string[]): Promise<any> => {
  const ai = getAI();
  const prompt = `Analyze these YouTube comments for the video: "${videoTitle}".
  
  Comments:
  ${comments.slice(0, 30).join('\n---\n')}
  
  1. Summarize people's reactions.
  2. Identify frequent keywords.
  3. Extract exactly 6 key topics/keywords for future video creation.
  4. Recommend a theme for the next video.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          sentiment: { type: Type.STRING },
          keywords: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Exactly 6 recommended keywords for future topics"
          },
          topicRecommendation: { type: Type.STRING }
        },
        required: ["summary", "sentiment", "keywords", "topicRecommendation"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateScriptOutline = async (keyword: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a brief video script outline (TOC) for a new YouTube video focused on the keyword: "${keyword}". Keep it concise and professional.`,
    config: {
      systemInstruction: "You are a professional YouTube script writer and content strategist.",
    }
  });

  return response.text;
};

export const chatWithGemini = async (history: { role: string, content: string }[], message: string) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are an AI assistant helping a user understand YouTube content. Use the provided video context to answer questions.",
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
