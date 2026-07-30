import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterUserCommand } from '../application/commands/register-user.command';
import { LoginUserCommand } from '../application/commands/login-user.command';
import { UserRole } from '../domain/enums/user-role.enum';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../infrastructure/decorators/current-user.decorator';

class RegisterRequestDto {
  email: string;
  fullName: string;
  password: string;
  role?: UserRole;
}

class LoginRequestDto {
  email: string;
  password: string;
}

@ApiTags('Auth & Identity')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới (Customer hoặc Warehouse Keeper)' })
  async register(@Body() dto: RegisterRequestDto) {
    return this.commandBus.execute(
      new RegisterUserCommand(dto.email, dto.fullName, dto.password, dto.role || UserRole.CUSTOMER),
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập lấy JWT Token' })
  async login(@Body() dto: LoginRequestDto) {
    return this.commandBus.execute(new LoginUserCommand(dto.email, dto.password));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin tài khoản hiện tại' })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }
}
