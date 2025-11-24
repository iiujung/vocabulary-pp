import { GoogleGenAI, Type, Schema } from "@google/genai";
import { VocabularyWord, CrosswordData, CrosswordWord } from "../types";

// Helper to sanitize JSON string if the model returns markdown code blocks
const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-2.5-flash';

// Schema for Crossword Generation
const crosswordSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    words: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          answer: { type: Type.STRING },
          clue: { type: Type.STRING },
          row: { type: Type.INTEGER, description: "0-indexed row start position" },
          col: { type: Type.INTEGER, description: "0-indexed col start position" },
          orientation: { type: Type.STRING, enum: ["across", "down"] }
        },
        required: ["answer", "clue", "row", "col", "orientation"]
      }
    },
    theme: { type: Type.STRING }
  },
  required: ["words", "theme"]
};

// Schema for Word Discovery
const discoverySchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING },
      definition: { type: Type.STRING }
    },
    required: ["word", "definition"]
  }
};

export const generateCrosswordFromList = async (words: VocabularyWord[]): Promise<CrosswordData> => {
  const wordListString = words.map(w => `${w.word}: ${w.definition}`).join("\n");
  
  const prompt = `
    Create a crossword puzzle layout using a selection of the following words. 
    The grid size should be maximum 12x12.
    Try to connect as many words as possible. 
    It is OK if not all words are used, but try to use at least 5-8 if provided.
    Ensure coordinates (row, col) are valid (0-11) and words do not overlap incorrectly.
    
    Words to use:
    ${wordListString}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: crosswordSchema,
        systemInstruction: "You are a professional crossword puzzle generator. Create valid, connected, intersection-free crossword layouts within a 12x12 grid."
      }
    });

    const data = JSON.parse(cleanJson(response.text || "{}")) as CrosswordData;
    return data;
  } catch (error) {
    console.error("Error generating crossword:", error);
    throw new Error("Failed to generate crossword.");
  }
};

export const generateDailyChallenge = async (): Promise<CrosswordData> => {
  const prompt = `
    Generate a fun, daily crossword puzzle. 
    Theme: General Knowledge or Trending Topics.
    Grid size: Max 12x12.
    Number of words: 6-10.
    Ensure intersections are valid.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: crosswordSchema,
        systemInstruction: "You are a professional crossword puzzle generator."
      }
    });

    const data = JSON.parse(cleanJson(response.text || "{}")) as CrosswordData;
    return data;
  } catch (error) {
    console.error("Error generating daily challenge:", error);
    throw new Error("Failed to generate daily challenge.");
  }
};

export const discoverNewWords = async (context: string, existingWords: VocabularyWord[]): Promise<Omit<VocabularyWord, 'id' | 'addedAt'>[]> => {
  const existingList = existingWords.map(w => w.word).join(", ");
  
  const prompt = `
    Suggest 5-8 interesting and useful English words for a learner.
    Context/Theme: ${context || "General, interesting words for daily life"}.
    Do NOT include these words: ${existingList}.
    Provide brief definitions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: discoverySchema
      }
    });

    return JSON.parse(cleanJson(response.text || "[]"));
  } catch (error) {
    console.error("Error discovering words:", error);
    throw new Error("Failed to discover new words.");
  }
};
