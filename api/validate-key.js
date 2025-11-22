import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { apiKey } = req.body;

    if (!apiKey || typeof apiKey !== 'string') {
        return res.status(400).json({ valid: false, error: 'API key required' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Use a lightweight request to validate the key
        // We'll try to count tokens for a simple string
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
