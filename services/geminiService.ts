import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY не настроен в переменных окружения.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeFace = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = getAI();
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
          text: "Проанализируй лицо человека на изображении. Оцени примерный возраст и определи психологический тип личности (психотип). Весь ответ должен быть строго на РУССКОМ ЯЗЫКЕ в формате JSON.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ageRange: { type: Type.STRING },
          psychotype: { type: Type.STRING },
          description: { type: Type.STRING },
          traits: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }
          },
          vibe: { type: Type.STRING },
          confidence: { type: Type.NUMBER }
        },
        required: ["ageRange", "psychotype", "description", "traits", "vibe", "confidence"]
      },
    },
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Пустой ответ от модели");
    return JSON.parse(text.trim()) as AnalysisResult;
  } catch (err) {
    console.error("Failed to parse Gemini response:", err);
    throw new Error("Не удалось интерпретировать результаты анализа.");
  }
};

export const speakAnalysis = async (text: string): Promise<void> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
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

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioData = decodeBase64(base64Audio);
  const buffer = await decodeAudioData(audioData, audioContext, 24000, 1);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
};

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
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