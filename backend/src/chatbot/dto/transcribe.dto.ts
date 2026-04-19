import { IsOptional, IsString } from 'class-validator';

export class TranscribeDto {
  @IsString()
  audioBase64!: string;

  @IsOptional()
  @IsString()
  filename?: string;
}
