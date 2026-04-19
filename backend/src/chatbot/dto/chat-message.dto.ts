import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class HistoryItemDto {
  @IsIn(['user', 'model'])
  role!: 'user' | 'model';

  @IsString()
  content!: string;
}

export class AttachmentDto {
  @IsString()
  mimeType!: string;

  @IsString()
  data!: string;
}

export class ChatMessageDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoryItemDto)
  history!: HistoryItemDto[];

  @IsString()
  message!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AttachmentDto)
  attachment?: AttachmentDto;
}

export class TtsDto {
  @IsString()
  text!: string;
}
