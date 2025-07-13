import { GoogleGenAI } from "@google/genai";
import { OperationType, ListType } from '../types';

// IMPORTANT: REPLACE "YOUR_API_KEY" WITH YOUR ACTUAL GOOGLE GEMINI API KEY
const API_KEY = "AIzaSyDUTy2ICCdGcHt7G0moLZF6eo9d2ReahVM";

let ai: GoogleGenAI | null = null;
let apiKeyError = false;

if (!API_KEY || API_KEY === "YOUR_API_KEY") {
  console.error("API_KEY is not set. Please replace 'YOUR_API_KEY' in services/geminiService.ts with your actual key.");
  apiKeyError = true;
} else {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}


const getOperationDescription = (operation: OperationType, listType: ListType, details: Record<string, any>): string => {
  const listTypeName = listType === 'doubly' ? 'doubly' : 'singly';
  switch (operation) {
    case OperationType.ADD_FIRST:
      return `the 'addFirst' method, inserting ${details.value} at the head of a ${listTypeName} linked list.`;
    case OperationType.ADD_LAST:
      return `the 'addLast' method, inserting ${details.value} at the tail of a ${listTypeName} linked list.`;
    case OperationType.REMOVE_FIRST:
      return `the 'removeFirst' method on a ${listTypeName} linked list. It will remove the head node and return its value.`;
    case OperationType.REMOVE_LAST:
      return `the 'removeLast' method on a ${listTypeName} linked list. It will remove the tail node and return its value.`;
    case OperationType.SEARCH:
      return `searching for the value ${details.value} in a ${listTypeName} linked list.`;
    default:
      return 'performing an unknown operation.';
  }
};

export const getExplanationForOperation = async (operation: OperationType, listType: ListType, details: Record<string, any>): Promise<string> => {
  if (apiKeyError || !ai) {
    return Promise.resolve("Could not get explanation. Please check that you have set your API key correctly in `services/geminiService.ts`.");
  }

  const description = getOperationDescription(operation, listType, details);
  const prompt = `
    You are an expert computer science teacher, explaining concepts from a textbook like Goodrich's. 
    Explain the process of ${description}.
    If the operation is 'removeLast' on a singly linked list, emphasize the need to traverse to find the node before the tail.
    If the operation is for a doubly linked list, be sure to mention how both the 'next' and 'prev' pointers are updated.
    If the operation returns a value (like removeFirst or removeLast), mention that.
    Keep the explanation simple, concise, and easy for a beginner to understand.
    Break it down into 2-3 clear steps. Do not use markdown or code formatting. Just provide the plain text explanation.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.5,
          topP: 0.95,
        }
    });

    return response.text;
  } catch (error) {
    console.error(`Error fetching explanation from Gemini for ${operation}:`, error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       return "Failed to get explanation. Your API key seems to be invalid. Please check it in `services/geminiService.ts`.";
    }
    throw new Error('Failed to communicate with Gemini API.');
  }
};