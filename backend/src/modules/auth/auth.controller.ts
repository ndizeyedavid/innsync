import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import type { Request } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { GoogleSignInDto } from './dto/google-sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

class ForgotPasswordDto {
  @IsEmail() email!: string;
}

class ResetPasswordDto {
  @IsString() token!: string;
  @IsString() @MinLength(8) @MaxLength(128) password!: string;
}

class UpdateProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
}

class ChangePasswordDto {
  @IsString() currentPassword!: string;
  @IsString() @MinLength(8) @MaxLength(128) newPassword!: string;
}

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('sign-up')
  @Public()
  @ApiOperation({ summary: 'Create a new account' })
  async signUp(@Body() dto: SignUpDto, @Req() req: Request) {
    return this.auth.signUp(dto, this.deviceInfo(req));
  }

  @Post('sign-in')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange credentials for tokens' })
  async signIn(@Body() dto: SignInDto, @Req() req: Request) {
    return this.auth.signIn(dto, this.deviceInfo(req));
  }

  @Post('google')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in or sign up with Google ID token' })
  async googleSignIn(@Body() dto: GoogleSignInDto, @Req() req: Request) {
    return this.auth.googleSignIn(dto, this.deviceInfo(req));
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate access + refresh tokens' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return { tokens: await this.auth.refresh(dto.refreshToken) };
  }

  @Post('sign-out')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the current session' })
  async signOut(@CurrentUser() user: AuthenticatedUser) {
    await this.auth.signOut(user.sessionId);
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.auth.forgotPassword(dto.email);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.auth.resetPassword(dto.token, dto.password);
    return { message: 'Password updated successfully' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return the authenticated user + guest profile' })
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.getMe(user.sub);
  }

  @Put('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile (name, phone)' })
  async updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.auth.updateProfile(user.sub, dto);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  async changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto) {
    await this.auth.changePassword(user.sub, dto.currentPassword, dto.newPassword);
    return { message: 'Password updated' };
  }

  private deviceInfo(req: Request): { ip?: string; userAgent?: string } {
    return {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
