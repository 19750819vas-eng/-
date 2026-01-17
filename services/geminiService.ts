
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeFace = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const base64Data = base64Image.split(',')[1] || base64Image;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data,
          },
        },
        {
          text: "Проанализируй лицо человека на изображении. Оцени примерный возраст и определи психологический тип личности (психотип), основываясь на выражении лица, стиле и микровыражениях. Весь ответ должен быть строго на РУССКОМ ЯЗЫКЕ в формате JSON.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ageRange: { type: Type.STRING, description: "Примерный возраст, например '25-30 лет'" },
          psychotype: { type: Type.STRING, description: "Название психотипа, например 'Аналитический экстраверт'" },
          description: { type: Type.STRING, description: "Детальный анализ характера из 2-3 предложений." },
          traits: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Список из 4 черт характера." 
          },
          vibe: { type: Type.STRING, description: "Одно слово, описывающее текущую энергию/вайб." },
          confidence: { type: Type.NUMBER, description: "Уровень уверенности от 0 до 1" }
        },
        required: ["ageRange", "psychotype", "description", "traits", "vibe", "confidence"]
      },
    },
  });

  try {
    return JSON.parse(response.text.trim()) as AnalysisResult;
  } catch (err) {
    console.error("Failed to parse Gemini response:", err);
    throw new Error("Не удалось интерпретировать результаты анализа.");
  }
};

export const speakAnalysis = async (text: string): Promise<void> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Произнеси спокойным и профессиональным тоном: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return;

  const audioData = decode(base64Audio);
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  
  const buffer = await decodeAudioData(audioData, audioContext, 24000, 1);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
};

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
