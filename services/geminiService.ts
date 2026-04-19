import { Message, Role } from '../types';

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api';

export const sendMessageToGemini = async (
  history: Message[],
  currentInput: string,
  attachment?: { mimeType: string; data: string },
): Promise<string> => {
  try {
    const res = await fetch(`${API_BASE}/chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: history.map((msg) => ({
          role: msg.role === Role.USER ? 'user' : 'model',
          content: msg.content,
        })),
        message: currentInput,
        attachment,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || `Chat request failed (${res.status})`);
    }

    const data = (await res.json()) as { text: string };
    return data.text;
  } catch (error: unknown) {
    console.error('MedNexus API Error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to connect to MedNexus Core.';
    throw new Error(msg);
  }
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
  const res = await fetch(`${API_BASE}/chatbot/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `TTS failed (${res.status})`);
  }

  return res.arrayBuffer();
};

export const pcmToAudioBuffer = (buffer: ArrayBuffer, ctx: AudioContext): AudioBuffer => {
  const pcmData = new Int16Array(buffer);
  const channelCount = 1;
  const sampleRate = 24000;

  const audioBuffer = ctx.createBuffer(channelCount, pcmData.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < pcmData.length; i++) {
    channelData[i] = pcmData[i] / 32768.0;
  }

  return audioBuffer;
};
