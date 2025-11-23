import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAllowedOrigin } from './config.js';

export default async function handler(req, res) {
    // Enable CORS with origin validation
    const origin = req.headers.origin;
    const allowedOrigin = getAllowedOrigin(origin);

    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { apiKey } = req.body;

    if (!apiKey || typeof apiKey !== 'string') {
        return res.status(400).json({ valid: false, error: 'API key required' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-2.0-flash for validation (lighter than image model, but same key scope)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Use a lightweight request to validate the key
        await model.countTokens("Hello");

        return res.status(200).json({ valid: true });
    } catch (error) {
        console.error('Key validation error:', error);
        return res.status(200).json({
            valid: false,
            error: 'Invalid API key'
        });
    }
}
