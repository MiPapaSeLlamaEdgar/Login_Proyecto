// src/routes/evaluacionRoutes.js
const express = require('express');
const router = express.Router();
const openaiService = require('../../openaiService'); // Asegúrate de que esta ruta sea correcta

// Ruta para mostrar el formulario de evaluación
router.get('/evaluacion', (req, res) => {
    res.render('evaluacion'); // Asegúrate de que 'evaluacion' corresponde a evaluacion.html en la carpeta 'views'
});

// Ruta para manejar la lógica de la evaluación (POST)
router.post('/submit-evaluation', async (req, res) => {
    const {
        productName, productDescription, technicalRequirements, technologyAvailability,
        technicalComments, testedRegions, performanceResults, fieldTestComments,
        developmentCosts, productionCosts, roiEstimate, economicComments, requiredResources,
        resourceAvailability, resourceComments, overallViability, generalComments
    } = req.body;

    const message = `
    Evaluación del Producto Agrícola:
    Producto: ${productName}
    Descripción: ${productDescription}
    Requisitos Técnicos: ${technicalRequirements}
    Disponibilidad de Tecnología: ${technologyAvailability}
    Comentarios Técnicos: ${technicalComments}
    Regiones Probadas: ${testedRegions}
    Resultados de Rendimiento: ${performanceResults}
    Comentarios sobre Pruebas de Campo: ${fieldTestComments}
    Costos de Desarrollo: ${developmentCosts}
    Costos de Producción: ${productionCosts}
    ROI Estimado: ${roiEstimate}
    Comentarios Económicos: ${economicComments}
    Recursos Necesarios: ${requiredResources}
    Disponibilidad de Recursos: ${resourceAvailability}
    Comentarios sobre Recursos: ${resourceComments}
    Viabilidad Global del Producto: ${overallViability}
    Comentarios Generales: ${generalComments}
    `;

    try {
        const gptResponse = await openaiService.getChatGPTResponse(message);
        res.json({ response: gptResponse });
    } catch (error) {
        console.error('Error en la evaluación de viabilidad:', error.message);
        res.status(500).json({ error: 'Error al evaluar la viabilidad del producto' });
    }
});

module.exports = router;
