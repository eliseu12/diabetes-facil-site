// Arquivo: netlify/functions/gemini-proxy.js

exports.handler = async function(event, context) {
    // 1. Pegar os dados enviados pelo seu chatbot (frontend)
    let requestPayload;
    try {
        requestPayload = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Corpo da requisição inválido ou mal formatado." }),
        };
    }

    // 2. Pegar sua API Key do Gemini (que estará guardada de forma segura no Netlify)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY_DIABETES_FACIL; // Nome específico para esta API Key

    if (!GEMINI_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "API Key do Gemini não configurada no servidor." }),
        };
    }

    // 3. Montar a URL da API do Gemini
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        // 4. Fazer a chamada para a API do Gemini DESTA FUNÇÃO (o intermediário)
        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload), // Envia o payload recebido do frontend
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Erro da API Gemini:", data);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Erro da API Gemini: ${data.error?.message || response.statusText}` }),
            };
        }

        // 5. Retornar a resposta da API do Gemini para o seu chatbot (frontend)
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error("Erro ao chamar a API Gemini:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Falha ao processar sua solicitação: ${error.message}` }),
        };
    }
};
