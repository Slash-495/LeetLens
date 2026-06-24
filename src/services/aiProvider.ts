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

  private static async performBackgroundFetch(url: string, options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        reject(new Error("Chrome runtime not available"));
        return;
      }
      chrome.runtime.sendMessage({
        type: 'FETCH_JSON',
        url,
        options
      }, (res) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!res) {
          reject(new Error("No response from background script"));
          return;
        }
        if (!res.success) {
          reject(new Error(res.error));
        } else {
          resolve(res.data);
        }
      });
    });
  }

  private static extractJSON(content: string): any {
    let cleanContent = content;
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```/g, '').trim();
    }
    return JSON.parse(cleanContent);
  }

  private static async genericGenerate(provider: AIProviderName, apiKey: string, systemPrompt: string, userPrompt: string, featureName: string): Promise<any> {
    if (!apiKey) throw new Error('API key is missing.');

    try {
      if (provider === 'OpenAI' || provider === 'OpenRouter') {
        const endpoint = provider === 'OpenAI' 
          ? 'https://api.openai.com/v1/chat/completions'
          : 'https://openrouter.ai/api/v1/chat/completions';
        
        const model = provider === 'OpenAI' ? 'gpt-4o' : 'meta-llama/llama-3.1-8b-instruct';

        const data = await this.performBackgroundFetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://leetlens.com', 
            'X-Title': 'LeetLens'
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
            response_format: { type: 'json_object' },
            stream: false
          })
        });

        const content = data.choices[0].message.content;
        return this.extractJSON(content);

      } else if (provider === 'Gemini') {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const data = await this.performBackgroundFetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        });

        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        return this.extractJSON(content);
      } else {
        throw new Error('Unsupported provider');
      }
    } catch (e: any) {
      console.error(`[LeetLens] ${featureName} Generation Error`, e);
      throw new Error(e.message || `Failed to generate ${featureName.toLowerCase()}. Please check your API key or try again.`);
    }
  }

  static async generateReview(provider: AIProviderName, apiKey: string, systemPrompt: string): Promise<any> {
    return this.genericGenerate(provider, apiKey, systemPrompt, "Please review the solution as per the system instructions.", "Review");
  }

  static async generateVisualization(provider: AIProviderName, apiKey: string, systemPrompt: string): Promise<any> {
    return this.genericGenerate(provider, apiKey, systemPrompt, "Please generate the execution trace visualization as per the system instructions.", "Visualization");
  }

  static async generateConceptCard(provider: AIProviderName, apiKey: string, systemPrompt: string): Promise<any> {
    return this.genericGenerate(provider, apiKey, systemPrompt, "Please generate the concept card as per the system instructions.", "Concept Card");
  }

  static async generateComparison(provider: AIProviderName, apiKey: string, systemPrompt: string): Promise<any> {
    return this.genericGenerate(provider, apiKey, systemPrompt, "Please generate the JSON response as per the system instructions.", "Comparison");
  }

  static async generateRecommendations(provider: AIProviderName, apiKey: string, systemPrompt: string): Promise<any> {
    return this.genericGenerate(provider, apiKey, systemPrompt, "Please generate the JSON response as per the system instructions.", "Recommendations");
  }

  static async generateSimilarProblems(provider: AIProviderName, apiKey: string, systemPrompt: string): Promise<any> {
    return this.genericGenerate(provider, apiKey, systemPrompt, "Please generate the JSON response as per the system instructions.", "Similar Problems");
  }

  static async generateConceptReinforcement(provider: AIProviderName, apiKey: string, systemPrompt: string): Promise<any> {
    return this.genericGenerate(provider, apiKey, systemPrompt, "Please generate the JSON response as per the system instructions.", "Concept Reinforcement");
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
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        throw new Error("Chrome runtime not available");
      }

      const port = chrome.runtime.connect({ name: 'ai-stream' });
      
      port.onMessage.addListener((msg) => {
        if (msg.type === 'CHUNK') {
          callbacks.onChunk(msg.text);
        } else if (msg.type === 'DONE') {
          callbacks.onDone();
          port.disconnect();
        } else if (msg.type === 'ERROR') {
          callbacks.onError(new Error(msg.error));
          port.disconnect();
        }
      });

      port.onDisconnect.addListener(() => {
        if (chrome.runtime.lastError) {
          callbacks.onError(new Error(chrome.runtime.lastError.message));
        }
      });

      if (provider === 'OpenAI' || provider === 'OpenRouter') {
        const endpoint = provider === 'OpenAI' 
          ? 'https://api.openai.com/v1/chat/completions'
          : 'https://openrouter.ai/api/v1/chat/completions';
        
        const model = provider === 'OpenAI' ? 'gpt-4o-mini' : 'meta-llama/llama-3.1-8b-instruct'; 

        const formattedMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ];

        port.postMessage({
          type: 'START_STREAM',
          request: {
            url: endpoint,
            options: {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://leetlens.com', 
                'X-Title': 'LeetLens'
              },
              body: JSON.stringify({
                model,
                messages: formattedMessages,
                stream: true
              })
            },
            isGemini: false
          }
        });
      } else if (provider === 'Gemini') {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

        const formattedMessages = messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        port.postMessage({
          type: 'START_STREAM',
          request: {
            url: endpoint,
            options: {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: formattedMessages,
              })
            },
            isGemini: true
          }
        });
      } else {
        callbacks.onError(new Error('Unsupported provider'));
        port.disconnect();
      }
    } catch (e: any) {
      callbacks.onError(e);
    }
  }
}
