try {
  if (window.monaco && window.monaco.editor) {
    const models = window.monaco.editor.getModels();
    let code = '';
    for (const model of models) {
      if (model.uri.path.includes('solution') || models.length === 1) {
        code = model.getValue();
        break;
      }
    }
    if (!code && models.length > 0) code = models[0].getValue();
    window.postMessage({ type: 'LEETLENS_CODE_RESULT', code }, '*');
  } else {
    window.postMessage({ type: 'LEETLENS_CODE_RESULT', code: 'Monaco editor not found. Make sure the editor has loaded.' }, '*');
  }
} catch (e) {
  window.postMessage({ type: 'LEETLENS_CODE_RESULT', code: 'Error extracting code.' }, '*');
}
