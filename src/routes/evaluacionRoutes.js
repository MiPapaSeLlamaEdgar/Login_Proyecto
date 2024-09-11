const express = require('express');
const router = express.Router();
const authorizeRoles = require('../middleware/authMiddleware.js');
const openaiService = require('../../openaiService');

// Ruta GET para renderizar la página de evaluación
router.get('/dashboard/functions/evaluacion', authorizeRoles(['Agricultores/Productores']), (req, res) => {
    res.render('dashboard/functions/evaluacion', {
        layout: 'main',
        user: req.session.user,
        role: req.session.role
    });
});

// Ruta POST para manejar la evaluación
router.post('/dashboard/functions/submit-evaluation', authorizeRoles(['Agricultores/Productores']), async (req, res) => {
    const {
        productName, productDescription, technicalRequirements, technologyAvailability,
        technicalComments, testedRegions, performanceResults, fieldTestComments,
        developmentCosts, productionCosts, roiEstimate, economicComments, requiredResources,
        resourceAvailability, resourceComments, overallViability, generalComments
    } = req.body;

    try {
        const technicalMessage = `
        Proporciona una evaluación técnica para el producto "${productName}" con un puntaje porcentual del 0% al 100% para cada uno de los siguientes factores:
        
        Requisitos Técnicos: ${technicalRequirements}
        Disponibilidad de Tecnología: ${technologyAvailability}
        Comentarios Técnicos: ${technicalComments}
        Regiones Probadas: ${testedRegions}
        Resultados de Rendimiento: ${performanceResults}
        Comentarios sobre Pruebas de Campo: ${fieldTestComments}

        Calcula una viabilidad técnica general como promedio de los puntajes.
        `;

        const technicalResponse = await openaiService.getChatGPTResponse(technicalMessage);

        const economicMessage = `
        Proporciona una evaluación económica para el producto "${productName}" con un puntaje porcentual del 0% al 100% para cada uno de los siguientes factores:

        Costos de Desarrollo: ${developmentCosts}
        Costos de Producción: ${productionCosts}
        ROI Estimado: ${roiEstimate}
        Comentarios Económicos: ${economicComments}
        Recursos Necesarios: ${requiredResources}
        Disponibilidad de Recursos: ${resourceAvailability}
        Comentarios sobre Recursos: ${resourceComments}

        Calcula una viabilidad económica general como promedio de los puntajes.
        `;

        const economicResponse = await openaiService.getChatGPTResponse(economicMessage);

        const commercialMessage = `
        Proporciona una evaluación comercial y funcional para el producto "${productName}" con un puntaje porcentual del 0% al 100% para cada uno de los siguientes factores:

        Viabilidad Global del Producto: ${overallViability}
        Comentarios Generales: ${generalComments}

        Calcula una viabilidad comercial y funcional general como promedio de los puntajes.
        `;

        const commercialResponse = await openaiService.getChatGPTResponse(commercialMessage);

        const combinedResponse = `
        **Análisis Técnico**\n${technicalResponse}\n
        **Análisis Económico**\n${economicResponse}\n
        **Análisis Comercial y Funcional**\n${commercialResponse}
        `;

        res.status(200).json({ response: combinedResponse.trim() });
    } catch (error) {
        console.error('Error al procesar la evaluación:', error.message);
        res.status(500).json({ error: 'Error al evaluar la viabilidad del producto' });
    }
});

module.exports = router;
