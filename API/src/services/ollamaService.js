const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const OLLAMA_API_URL = process.env.OLLAMA_API_URL;

exports.sendMessageToOllama = async (model, prompt, system) => {
  try {
    const response = await axios.post(OLLAMA_API_URL, {
      model,
      prompt,
      system,
      format: "json",
      stream: false,
    });

    return response.data;
  } catch (error) {
    console.error('Error communicating with Ollama API:', error.response?.data || error.message);
    throw new Error('Failed to communicate with Ollama API');
  }
};
