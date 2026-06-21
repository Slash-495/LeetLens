export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export type AIProviderName = 'Gemini' | 'OpenAI' | 'OpenRouter';

export interface AIStreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

export class AIService {
  static async streamChat(
    provider: AIProviderName,
    apiKey: string,
    systemPrompt: string,
    messages: Message[],
    callbacks: AIStreamCallbacks
  ) {
    if (!apiKey) {
      callbacks.onError(new Error('API key is missing. Please configure it in settings.'));
      return;
    }

    try {
      if (provider === 'OpenAI' || provider === 'OpenRouter') {
        await this.streamOpenAIFormat(provider, apiKey, systemPrompt, messages, callbacks);
      } else if (provider === 'Gemini') {
        await this.streamGeminiFormat(apiKey, systemPrompt, messages, callbacks);
      } else {
        callbacks.onError(new Error('Unsupported provider'));
      }
    } catch (e: any) {
      callbacks.onError(e);
    }
  }

  private static async streamOpenAIFormat(provider: AIProviderName, apiKey: string, systemPrompt: string, messages: Message[], callbacks: AIStreamCallbacks) {
    const endpoint = provider === 'OpenAI' 
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://openrouter.ai/api/v1/chat/completions';
    
    // Default lightweight models for code assistance
    const model = provider === 'OpenAI' ? 'gpt-4o-mini' : 'meta-llama/llama-3.1-8b-instruct'; 

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        // Required for OpenRouter
        'HTTP-Referer': 'https://leetlens.com', 
        'X-Title': 'LeetLens'
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        stream: true
      })
    });

    if (!response.ok) {
      let errText = response.statusText;
      try { const errJson = await response.json(); errText = errJson.error?.message || errText; } catch(e){}
      throw new Error(`API Error: ${errText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) throw new Error('No readable stream');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.trim() !== '');
      for (const line of lines) {
        if (line.includes('[DONE]')) {
          callbacks.onDone();
          return;
        }
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.choices && data.choices[0].delta?.content) {
              callbacks.onChunk(data.choices[0].delta.content);
            }
          } catch (e) {}
        }
      }
    }
    callbacks.onDone();
  }

  private static async streamGeminiFormat(apiKey: string, systemPrompt: string, messages: Message[], callbacks: AIStreamCallbacks) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

    const formattedMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: formattedMessages,
      })
    });

    if (!response.ok) {
      let errText = response.statusText;
      try { const errJson = await response.json(); errText = errJson.error?.message || errText; } catch(e){}
      throw new Error(`API Error: ${errText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) throw new Error('No readable stream');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              callbacks.onChunk(text);
            }
          } catch (e) {}
        }
      }
    }
    callbacks.onDone();
  }
}
