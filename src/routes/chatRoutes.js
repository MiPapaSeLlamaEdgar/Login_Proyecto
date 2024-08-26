// src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const openaiService = require('../../openaiService'); // Ajusta la ruta

router.get('/chat', (req, res) => {
  res.render('chat'); // Renderiza la vista chat.html dentro de la carpeta views
});

router.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const gptResponse = await openaiService.getChatGPTResponse(userMessage);
    res.json({ response: gptResponse });
  } catch (error) {
    console.error('Error en la ruta /chat:', error.message);
    res.status(500).json({ error: 'No se pudo comunicar con el servicio de OpenAI' });
  }
});

module.exports = router;
