import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { BookingModule } from './booking/booking.module';
import { UsersModule } from './users/users.module';
import { MetricsModule } from './metrics/metrics.module';
import { GpuModule } from './gpu/gpu.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GpuModule,
    MetricsModule,
    AuthModule,
    ChatbotModule,
    BookingModule,
    UsersModule,
  ],
})
export class AppModule {}
