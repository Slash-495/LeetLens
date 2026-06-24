chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'FETCH_JSON') {
    handleFetchJson(request)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message || String(error) }));
    return true; // Keep message channel open for async
  }
});

async function handleFetchJson(request: any) {
  const { url, options } = request;
  
  // Need to ensure headers are properly parsed if passed as object
  if (options.headers) {
    options.headers = new Headers(options.headers);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const errText = errData?.error?.message || response.statusText;
    throw new Error(`API Error: ${errText}`);
  }

  return response.json();
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'ai-stream') {
    port.onMessage.addListener(async (msg) => {
      if (msg.type === 'START_STREAM') {
        try {
          await handleStream(msg.request, port);
        } catch (err: any) {
          port.postMessage({ type: 'ERROR', error: err.message || String(err) });
        }
      }
    });
  }
});

async function handleStream(request: any, port: chrome.runtime.Port) {
  const { url, options, isGemini } = request;
  
  if (options.headers) {
    options.headers = new Headers(options.headers);
  }

  const response = await fetch(url, options);

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
      if (isGemini) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              port.postMessage({ type: 'CHUNK', text });
            }
          } catch (e) {}
        }
      } else {
        if (line.includes('[DONE]')) {
          port.postMessage({ type: 'DONE' });
          return;
        }
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.choices && data.choices[0].delta?.content) {
              port.postMessage({ type: 'CHUNK', text: data.choices[0].delta.content });
            }
          } catch (e) {}
        }
      }
    }
  }
  
  port.postMessage({ type: 'DONE' });
}
