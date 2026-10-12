import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import { store } from './state/store.js';
import { loadPresetBox } from './preset/presetBox.js';

// 先injectpresetbox contoh再挂载，hindari flash box kosong；assetmuatgagalapp tetap bisa dibuka。
// ?heroTest/?embTest/?surfaceTest debugscene自带测试Layer，lewatipresetinject。
const debugScene = ['heroTest', 'embTest', 'surfaceTest'].some(k => new URLSearchParams(location.search).has(k));
loadPresetBox().catch(() => null).then(preset => {
  if (preset && !debugScene) store.reset(preset);
  createRoot(document.getElementById('root')).render(<App />);
});
