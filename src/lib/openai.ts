import OpenAI from 'openai';

// This would typically come from environment variables
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // In production, API calls should be made server-side
});

export async function getLegalResponse(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'You are a legal research assistant. Provide accurate, helpful information about legal topics. Include citations to relevant cases, statutes, or legal principles when appropriate. Be thorough but concise.'
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      model: 'gpt-3.5-turbo',
    });

    return completion.choices[0]?.message.content || 'No response generated.';
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return 'An error occurred while generating a response. Please try again.';
  }
}