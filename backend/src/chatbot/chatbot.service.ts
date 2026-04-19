import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { GpuClientService } from '../gpu/gpu-client.service';
import { MetricsService } from '../metrics/metrics.service';
import type { ChatMessageDto } from './dto/chat-message.dto';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly gemini: GeminiService,
    private readonly gpu: GpuClientService,
    private readonly metrics: MetricsService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Local transformers models (e.g. gpt2) are not safe for medical Q&A and often
   * produce repetitive junk. Chat defaults to Gemini; set USE_LOCAL_LLM_FOR_CHAT=true
   * only when you run a proper instruct model + prompts. GPU Whisper stays on /transcribe.
   */
  private shouldTryLocalGpu(dto: ChatMessageDto): boolean {
    const enabled =
      String(this.config.get('USE_LOCAL_LLM_FOR_CHAT') ?? '')
        .toLowerCase()
        .trim() === 'true';
    if (!enabled) return false;
    if (dto.attachment) return false;
    const maxLen = Number(this.config.get('LOCAL_LLM_MAX_CHARS') ?? 400);
    if (dto.message.length > maxLen) return false;
    const minLen = Number(this.config.get('LOCAL_LLM_MIN_CHARS') ?? 8);
    if (dto.message.trim().length < minLen) return false;
    return !!this.gpu.baseUrl();
  }

  async chat(dto: ChatMessageDto) {
    const t0 = Date.now();
    const route = 'POST /chatbot/message';

    if (this.shouldTryLocalGpu(dto)) {
      const health = await this.gpu.health();
      if (health?.ok) {
        try {
          const text = await this.gpu.generate(dto.message);
          const latencyMs = Date.now() - t0;
          this.metrics.record(route, 'local_gpu', latencyMs);
          return {
            text,
            source: 'local_gpu' as const,
            latencyMs,
          };
        } catch (e) {
          this.logger.warn(`Local GPU LLM failed, falling back to Gemini: ${e}`);
        }
      }
    }

    const text = await this.gemini.sendChat(
      dto.history,
      dto.message,
      dto.attachment,
    );
    const latencyMs = Date.now() - t0;
    this.metrics.record(route, 'gemini', latencyMs);
    return {
      text,
      source: 'gemini' as const,
      latencyMs,
    };
  }

  async tts(text: string): Promise<Buffer> {
    const t0 = Date.now();
    const buf = await this.gemini.generateSpeechPcm(text);
    this.metrics.record('POST /chatbot/tts', 'tts_gemini', Date.now() - t0);
    return buf;
  }

  async transcribe(audioBase64: string, filename?: string) {
    if (!this.gpu.baseUrl()) {
      throw new BadRequestException(
        'GPU_SERVICE_URL is not set; start gpu-service and configure the URL.',
      );
    }
    const t0 = Date.now();
    const raw = Buffer.from(audioBase64, 'base64');
    const text = await this.gpu.transcribe(raw, filename ?? 'clip.webm');
    this.metrics.record('POST /chatbot/transcribe', 'local_gpu', Date.now() - t0);
    return { text };
  }
}
