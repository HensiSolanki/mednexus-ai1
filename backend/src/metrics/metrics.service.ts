import { Injectable } from '@nestjs/common';

export type InferenceSource = 'gemini' | 'local_gpu' | 'tts_gemini';

export interface MetricRecord {
  at: number;
  route: string;
  source: InferenceSource;
  latencyMs: number;
}

@Injectable()
export class MetricsService {
  private readonly max = 500;
  private records: MetricRecord[] = [];

  record(route: string, source: InferenceSource, latencyMs: number): void {
    this.records.push({ at: Date.now(), route, source, latencyMs });
    if (this.records.length > this.max) {
      this.records = this.records.slice(-this.max);
    }
  }

  summary() {
    const bySource = {} as Record<string, { count: number; avgLatencyMs: number }>;
    for (const r of this.records) {
      if (!bySource[r.source]) {
        bySource[r.source] = { count: 0, avgLatencyMs: 0 };
      }
      const b = bySource[r.source];
      const n = b.count + 1;
      b.avgLatencyMs = (b.avgLatencyMs * b.count + r.latencyMs) / n;
      b.count = n;
    }
    return {
      total: this.records.length,
      bySource,
      recent: this.records.slice(-20),
    };
  }
}
