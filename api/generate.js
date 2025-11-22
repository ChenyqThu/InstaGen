import { GoogleGenAI, Modality } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const systemApiKey = process.env.GEMINI_API_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!systemApiKey) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Server configuration error: Missing Supabase credentials' });
    }

    try {
        // Verify user authentication
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'auth_required', message: 'Authentication required' });
        }

        // Create Supabase client with service role for server-side operations
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Verify the JWT token and get user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'auth_required', message: 'Invalid or expired token' });
        }

        // Check if user has a custom API key
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('custom_gemini_key')
            .eq('id', user.id)
            .single();

        let apiKey = systemApiKey;
        let useCustomKey = false;

        if (profile?.custom_gemini_key) {
            apiKey = profile.custom_gemini_key;
            useCustomKey = true;
        } else {
            // Check quota for users using system key
            const today = new Date().toISOString().split('T')[0];
            const { data: usage } = await supabase
                .from('user_usage')
                .select('gemini_calls')
                .eq('user_id', user.id)
                .eq('usage_date', today)
                .maybeSingle();

            const usedCalls = usage?.gemini_calls || 0;
            const dailyLimit = 3;

            if (usedCalls >= dailyLimit) {
                return res.status(429).json({
                    error: 'quota_exceeded',
                    message: 'Daily limit reached',
                    limit: dailyLimit,
                    used: usedCalls,
                });
            }
        }

        // Process the image generation request
        const { base64Image, prompt } = req.body;

        if (!base64Image || !prompt) {
            return res.status(400).json({ error: 'Missing base64Image or prompt' });
        }

        const ai = new GoogleGenAI({ apiKey });

        // Remove data URL prefix if present to get raw base64
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: cleanBase64,
                            mimeType: 'image/png',
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part && part.inlineData && part.inlineData.data) {
            const newBase64 = `data:image/png;base64,${part.inlineData.data}`;

            // Update usage count only if using system key
            if (!useCustomKey) {
                const today = new Date().toISOString().split('T')[0];
                await supabase.rpc('increment_usage', {
                    p_user_id: user.id,
                    p_date: today,
                });
            }

            return res.status(200).json({ image: newBase64 });
        } else {
            throw new Error("No image data received from Gemini.");
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
