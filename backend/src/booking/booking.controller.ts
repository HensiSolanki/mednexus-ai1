import { Body, Controller, Get, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookDto } from './dto/book.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly booking: BookingService) {}

  @Get('slots')
  slots() {
    return { slots: this.booking.listSlots() };
  }

  @Post('book')
  book(@Body() dto: BookDto) {
    return this.booking.book(dto.slotId, dto.patientEmail);
  }
}
