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
  static async generateReview(provider: AIProviderName, apiKey: string, systemPrompt: string): Promise<any> {
    if (!apiKey) throw new Error('API key is missing.');

    try {
      if (provider === 'OpenAI' || provider === 'OpenRouter') {
        const endpoint = provider === 'OpenAI' 
          ? 'https://api.openai.com/v1/chat/completions'
          : 'https://openrouter.ai/api/v1/chat/completions';
        
        const model = provider === 'OpenAI' ? 'gpt-4o' : 'meta-llama/llama-3.1-8b-instruct';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://leetlens.com', 
            'X-Title': 'LeetLens'
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: systemPrompt }],
            response_format: { type: 'json_object' },
            stream: false
          })
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        let content = data.choices[0].message.content;
        
        // Sometimes LLMs still wrap in markdown
        if (content.startsWith('\`\`\`json')) {
          content = content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        } else if (content.startsWith('\`\`\`')) {
          content = content.replace(/\`\`\`/g, '').trim();
        }
        
        return JSON.parse(content);
      } else if (provider === 'Gemini') {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: "Please review the solution as per the system instructions." }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        
        if (content.startsWith('\`\`\`json')) {
          content = content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        } else if (content.startsWith('\`\`\`')) {
          content = content.replace(/\`\`\`/g, '').trim();
        }

        return JSON.parse(content);
      } else {
        throw new Error('Unsupported provider');
      }
    } catch (e: any) {
      console.error("[LeetLens] Review Generation Error", e);
      throw new Error("Failed to generate review. Please check your API key and ensure the code is not empty.");
    }
  }

  static async generateVisualization(provider: AIProviderName, apiKey: string, systemPrompt: string): Promise<any> {
    if (!apiKey) throw new Error('API key is missing.');

    try {
      if (provider === 'OpenAI' || provider === 'OpenRouter') {
        const endpoint = provider === 'OpenAI' 
          ? 'https://api.openai.com/v1/chat/completions'
          : 'https://openrouter.ai/api/v1/chat/completions';
        
        const model = provider === 'OpenAI' ? 'gpt-4o' : 'meta-llama/llama-3.1-8b-instruct';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://leetlens.com', 
            'X-Title': 'LeetLens'
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: systemPrompt }],
            response_format: { type: 'json_object' },
            stream: false
          })
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        let content = data.choices[0].message.content;
        
        if (content.startsWith('\`\`\`json')) {
          content = content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        } else if (content.startsWith('\`\`\`')) {
          content = content.replace(/\`\`\`/g, '').trim();
        }
        
        return JSON.parse(content);
      } else if (provider === 'Gemini') {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: "Please generate the execution trace visualization as per the system instructions." }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        
        if (content.startsWith('\`\`\`json')) {
          content = content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        } else if (content.startsWith('\`\`\`')) {
          content = content.replace(/\`\`\`/g, '').trim();
        }

        return JSON.parse(content);
      } else {
        throw new Error('Unsupported provider');
      }
    } catch (e: any) {
      console.error("[LeetLens] Visualization Generation Error", e);
      throw new Error("Failed to generate visualization. Please check your API key or try again.");
    }
  }

  static async generateConceptCard(provider: AIProviderName, apiKey: string, systemPrompt: string): Promise<any> {
    if (!apiKey) throw new Error('API key is missing.');

    try {
      if (provider === 'OpenAI' || provider === 'OpenRouter') {
        const endpoint = provider === 'OpenAI' 
          ? 'https://api.openai.com/v1/chat/completions'
          : 'https://openrouter.ai/api/v1/chat/completions';
        
        const model = provider === 'OpenAI' ? 'gpt-4o' : 'meta-llama/llama-3.1-8b-instruct';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://leetlens.com', 
            'X-Title': 'LeetLens'
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: systemPrompt }],
            response_format: { type: 'json_object' },
            stream: false
          })
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        let content = data.choices[0].message.content;
        
        if (content.startsWith('\`\`\`json')) {
          content = content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        } else if (content.startsWith('\`\`\`')) {
          content = content.replace(/\`\`\`/g, '').trim();
        }
        
        return JSON.parse(content);
      } else if (provider === 'Gemini') {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: "Please generate the concept card as per the system instructions." }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        
        if (content.startsWith('\`\`\`json')) {
          content = content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        } else if (content.startsWith('\`\`\`')) {
          content = content.replace(/\`\`\`/g, '').trim();
        }

        return JSON.parse(content);
      } else {
        throw new Error('Unsupported provider');
      }
    } catch (e: any) {
      console.error("[LeetLens] Concept Card Generation Error", e);
      throw new Error("Failed to generate concept card. Please try again.");
    }
  }

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
