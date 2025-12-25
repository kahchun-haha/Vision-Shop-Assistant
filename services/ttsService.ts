/**
 * Handles Text-to-Speech (TTS) functionality.
 * Optimized for low-latency feedback for visually impaired users.
 */

export const speak = (text: string, priority: 'high' | 'normal' = 'normal') => {
  if (!window.speechSynthesis) return;

  // Clear queue if high priority to prevent lag behind real-time events
  if (priority === 'high') {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Faster rate (1.1) helps keep up with high-frequency scans
  utterance.rate = 1.1; 
  utterance.pitch = 1.0; 
  utterance.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.includes('en-US') && (v.name.includes('Google') || v.name.includes('Natural'))) || voices[0];
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
};

export const playSound = (type: 'success' | 'error' | 'click') => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'success') {
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  } else if (type === 'error') {
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  } else if (type === 'click') {
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  }

  osc.start();
  osc.stop(ctx.currentTime + 0.5);
};