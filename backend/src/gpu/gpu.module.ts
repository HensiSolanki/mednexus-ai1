import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GpuClientService } from './gpu-client.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [GpuClientService],
  exports: [GpuClientService],
})
export class GpuModule {}
