
import { GoogleGenAI, Type } from "@google/genai";
import { FarmFinancials } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const parseFarmLog = async (rawText: string): Promise<FarmFinancials> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Role: Professional Farm Data Analyst.
    Task: Extract financial data from the provided weekly farm log into a structured JSON format.
    
    Categorization Rules:
    - Revenue: 
        - morningMilk: Revenue from milk sold in the morning.
        - eveningMilk: Revenue from milk sold in the evening.
        - miscSales: Revenue from Eggs, Livestock (Chickens, Pigs, etc.), Produce, or other sources.
    - Expenses:
        - feed: Total cost for all animal feed (Cow, Pig, Cattle, Chicken feed).
        - healthcare: Total cost for Vet visits, Medicine, and Healthcare.
        - operations: Total cost for Diesel, Electricity, Tools, and Fuel.
    - Credit:
        - owed: Total credit extended to customers (money pending/owed to farm).
        - collected: Total credit collected from previous outstanding balances.
    
    Log content: "${rawText}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          revenue: {
            type: Type.OBJECT,
            properties: {
              morningMilk: { type: Type.NUMBER },
              eveningMilk: { type: Type.NUMBER },
              miscSales: { type: Type.NUMBER }
            },
            required: ["morningMilk", "eveningMilk", "miscSales"]
          },
          expenses: {
            type: Type.OBJECT,
            properties: {
              feed: { type: Type.NUMBER },
              healthcare: { type: Type.NUMBER },
              operations: { type: Type.NUMBER }
            },
            required: ["feed", "healthcare", "operations"]
          },
          credit: {
            type: Type.OBJECT,
            properties: {
              owed: { type: Type.NUMBER },
              collected: { type: Type.NUMBER }
            },
            required: ["owed", "collected"]
          }
        },
        required: ["revenue", "expenses", "credit"]
      }
    }
  });

  try {
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as FarmFinancials;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Could not interpret the farm log. Please ensure it contains numerical values.");
  }
};
