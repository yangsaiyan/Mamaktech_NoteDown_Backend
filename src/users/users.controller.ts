import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async registerUser() {
    try {
      const result = await this.usersService.registerUser();
      return {
        status: 'success',
        data: {
          userId: result.user.id,
          secretWords: result.secretWords,
          token: result.accessToken,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message || 'Registration failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: { secrets: string[] }) {
    try {
      const result = await this.usersService.loginWithSecrets(loginDto.secrets);
      return {
        status: 'success',
        data: {
          userId: result.user.id,
          secret: result.user.secret,
          token: result.accessToken,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new HttpException(
          {
            status: 'error',
            message: error.message || 'Invalid credentials',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw new HttpException(
        {
          status: 'error',
          message: 'Login failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
