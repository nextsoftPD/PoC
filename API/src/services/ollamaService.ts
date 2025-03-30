import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_API_URL: string | undefined = process.env.OLLAMA_API_URL;

if (!OLLAMA_API_URL) {
  throw new Error('Missing OLLAMA_API_URL in environment variables');
}

export const sendMessageToOllama = async (
  model: string,
  prompt: string,
  system: string
): Promise<any> => {
  try {
    const response = await axios.post(OLLAMA_API_URL, {
      model,
      prompt,
      system,
      format: 'json',
      stream: false,
    });

    return response.data;
  } catch (error: any) {
    console.error(
      'Error communicating with Ollama API:',
      error.response?.data || error.message
    );
    throw new Error('Failed to communicate with Ollama API');
  }
};
