import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { Message, Role } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are MedNexus, a highly advanced, futuristic medical AI assistant. 

CORE OPERATING PROTOCOLS:

1.  **DOMAIN EXCLUSIVITY**: You must ONLY answer questions related to healthcare, medicine, anatomy, physiology, nutrition, fitness, and mental health. For unrelated topics (e.g., coding, sports, general news), politely decline and redirect focus to healthcare.

2.  **MEDICAL SAFETY OVERRIDE**: 
    - You are an AI, not a doctor. 
    - If the user describes **EMERGENCY SYMPTOMS** (e.g., crushing chest pain, difficulty breathing, drooping face/stroke signs, severe bleeding, sudden confusion, blue lips), you must **IMMEDIATELY** stop normal processing and direct them to call emergency services (911 or local equivalent).

3.  **INTELLIGENT TRIAGE MODE**:
    - If a user asks to "Start Triage", "Check Symptoms", or presents a vague complaint (e.g., "my stomach hurts"), initiate the **TRIAGE PROTOCOL**.
    - **Step 1 (Discovery)**: Ask targeted, clarifying questions **ONE BY ONE**. Do not dump a list of questions. Wait for the user's response before asking the next.
      - Ask about: Onset (when it started), Severity (1-10), Duration, and Associated Symptoms.
    - **Step 2 (Analysis)**: Continuously evaluate answers for red flags.
    - **Step 3 (Report)**: Once sufficient info is gathered (usually after 3-4 exchanges), provide a **TRIAGE ASSESSMENT**.

4.  **RESPONSE FORMATTING**:
    - Use Markdown for structure.
    - Use **bold** for key terms and emphasis.
    - Use \`### Header\` for section titles.
    - Use \`- Bullet points\` for lists.
    
    **Format for Triage Assessment:**
    ### Triage Assessment
    - **Urgency Level**: [RED (Emergency) / YELLOW (See Doctor Soon) / GREEN (Self-Care)]
    - **Analysis**: [Brief clinical reasoning based on inputs]
    - **Recommended Action**: [Clear, actionable next step]

5.  **VISUAL ANALYSIS**:
    - If an image is provided, analyze it for visual medical indicators (e.g., rash characteristics, swelling, discoloration).
    - Provide a descriptive analysis but ALWAYS append a disclaimer that image analysis is experimental.

6.  **TONE**: Futuristic, professional, empathetic, and concise.
`;

export const sendMessageToGemini = async (
  history: Message[], 
  currentInput: string, 
  attachment?: { mimeType: string; data: string }
): Promise<string> => {
  
  try {
    // Map history for Gemini API
    const previousHistory = history.map(msg => ({
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const modelId = 'gemini-2.5-flash';

    if (attachment) {
      const parts: any[] = [
        {
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.data
          }
        },
        { text: currentInput }
      ];

      const response = await ai.models.generateContent({
        model: modelId,
        contents: { parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });
      
      return response.text || "I processed the image but could not generate a text response.";
    } 
    else {
      const chat = ai.chats.create({
        model: modelId,
        history: previousHistory,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });

      const response: GenerateContentResponse = await chat.sendMessage({ message: currentInput });
      return response.text || "No response generated.";
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to connect to MedNexus Core.");
  }
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
  try {
    // Clean text of markdown symbols for better speech
    const cleanText = text.replace(/[*#]/g, '');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data returned");
    }

    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;

  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

// Helper to convert raw PCM (Int16) to AudioBuffer (Float32)
// Gemini TTS returns raw PCM data at 24kHz
export const pcmToAudioBuffer = (buffer: ArrayBuffer, ctx: AudioContext): AudioBuffer => {
  const pcmData = new Int16Array(buffer);
  const channelCount = 1;
  const sampleRate = 24000;
  
  const audioBuffer = ctx.createBuffer(channelCount, pcmData.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  
  for (let i = 0; i < pcmData.length; i++) {
    // Convert int16 to float32 (-1.0 to 1.0)
    channelData[i] = pcmData[i] / 32768.0;
  }
  
  return audioBuffer;
};