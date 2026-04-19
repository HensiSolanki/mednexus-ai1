import { Controller, Get, Query } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get('profile')
  profile(@Query('email') email?: string) {
    return {
      message:
        'Wire JWT middleware later; for now use /auth/login and store user client-side.',
      email: email ?? null,
    };
  }
}
