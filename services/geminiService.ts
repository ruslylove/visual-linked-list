import { GoogleGenAI } from "@google/genai";
import { OperationType, ListType } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set. Please set the environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

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
    throw new Error('Failed to communicate with Gemini API.');
  }
};