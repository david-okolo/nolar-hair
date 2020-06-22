import { Controller, Get, Post, UseGuards, Request, Body, BadRequestException } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/guard/local.guard';
import { AuthService } from './auth/auth.service';
import { LoggerService } from './logger/logger.service';
import { JwtAuthGuard } from './auth/guard/jwt.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private logger: LoggerService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @UseGuards(JwtAuthGuard)
  @Post('auth/register')
  async register(@Body() createUser: any) {
    await this.authService.register(createUser).catch(e => {
      this.logger.error(`Registration for user ${createUser.username}`, e.stack);
      throw new BadRequestException(e.message);
    });

    return {
      success: true,
      message: 'Registered Successfullly'
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() request: any) {
    const token = this.authService.login(request.user);
    return {
      success: true,
      message: "Logged in succesfully",
      token
    }
  }
}
