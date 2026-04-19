import {
  Controller,
  Post,
  Body,
  Res,
  Header,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { ChatbotService } from './chatbot.service';
import { ChatMessageDto, TtsDto } from './dto/chat-message.dto';
import { TranscribeDto } from './dto/transcribe.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbot: ChatbotService) {}

  @Post('message')
  async message(@Body() dto: ChatMessageDto) {
    return this.chatbot.chat(dto);
  }

  @Post('tts')
  @Header('Content-Type', 'application/octet-stream')
  async tts(@Body() body: TtsDto, @Res({ passthrough: true }) _res: Response) {
    const buf = await this.chatbot.tts(body.text);
    return new StreamableFile(buf);
  }

  @Post('transcribe')
  async transcribe(@Body() dto: TranscribeDto) {
    return this.chatbot.transcribe(dto.audioBase64, dto.filename);
  }
}
