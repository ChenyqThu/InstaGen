import { supabase } from '../src/services/supabaseClient';

export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  // Get current user session token
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('auth_required');
  }

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ base64Image, prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (response.status === 401) {
        throw new Error('auth_required');
      }
      if (response.status === 429) {
        throw new Error('quota_exceeded');
      }

      throw new Error(errorData.error || 'generation_failed');
    }

    const data = await response.json();
    return data.image;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};