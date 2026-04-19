import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';

export interface GpuHealth {
  ok: boolean;
  cuda?: boolean;
  whisper?: string;
  llm?: string;
}

@Injectable()
export class GpuClientService {
  private readonly logger = new Logger(GpuClientService.name);

  constructor(private readonly config: ConfigService) {}

  baseUrl(): string {
    return (this.config.get<string>('GPU_SERVICE_URL') ?? '').replace(/\/$/, '');
  }

  async health(): Promise<GpuHealth | null> {
    const base = this.baseUrl();
    if (!base) return null;
    try {
      const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) return { ok: false };
      return (await res.json()) as GpuHealth;
    } catch (e) {
      this.logger.debug(`GPU health check failed: ${e}`);
      return null;
    }
  }

  async transcribe(audio: Buffer, filename: string): Promise<string> {
    const base = this.baseUrl();
    if (!base) throw new Error('GPU_SERVICE_URL not configured');

    const form = new FormData();
    form.append('file', audio, { filename });

    const res = await fetch(`${base}/transcribe`, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form as unknown as BodyInit,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GPU transcribe failed: ${res.status} ${text}`);
    }
    const data = (await res.json()) as { text: string };
    return data.text;
  }

  async generate(text: string): Promise<string> {
    const base = this.baseUrl();
    if (!base) throw new Error('GPU_SERVICE_URL not configured');

    const res = await fetch(`${base}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`GPU generate failed: ${res.status} ${errText}`);
    }
    const data = (await res.json()) as { text: string };
    return data.text;
  }
}
