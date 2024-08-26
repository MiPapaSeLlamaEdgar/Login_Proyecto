// openaiService.js
const axios = require('axios');
require('dotenv').config(); // Para cargar las variables de entorno desde .env

const openaiApiKey = process.env.OPENAI_API_KEY;

async function getChatGPTResponse(message) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error al comunicarse con OpenAI:', error.message);
    throw new Error('No se pudo comunicar con el servicio de OpenAI');
  }
}

module.exports = {
  getChatGPTResponse,
};
