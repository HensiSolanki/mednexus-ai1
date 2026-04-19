import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenAI,
  Modality,
  type GenerateContentResponse,
} from '@google/genai';
import type { HistoryItemDto } from './dto/chat-message.dto';

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

@Injectable()
export class GeminiService {
  private readonly ai: GoogleGenAI;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('GEMINI_API_KEY');
    if (!key) {
      throw new Error('GEMINI_API_KEY is required for MedNexus backend');
    }
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  async sendChat(
    history: HistoryItemDto[],
    currentInput: string,
    attachment?: { mimeType: string; data: string },
  ): Promise<string> {
    const previousHistory = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const modelId = 'gemini-2.5-flash';

    if (attachment) {
      const parts: unknown[] = [
        {
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.data,
          },
        },
        { text: currentInput },
      ];

      const response = await this.ai.models.generateContent({
        model: modelId,
        contents: { parts: parts as never },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      return response.text ?? 'I processed the image but could not generate a text response.';
    }

    const chat = this.ai.chats.create({
      model: modelId,
      history: previousHistory as never,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const response: GenerateContentResponse = await chat.sendMessage({
      message: currentInput,
    });
    return response.text ?? 'No response generated.';
  }

  async generateSpeechPcm(text: string): Promise<Buffer> {
    const cleanText = text.replace(/[*#]/g, '');

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
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

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error('No audio data returned from TTS');
    }

    return Buffer.from(base64Audio, 'base64');
  }
}
