import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public } from 'src/common/decorators/public.decorator';
import { HotelManagerService } from './hotel-manager.service';
import { AdminSignUpDto } from './dto/admin-signup.dto';

@ApiTags('admin-auth')
@Controller('admin/auth')
@UseGuards(ThrottlerGuard)
export class AdminAuthController {
  constructor(private readonly svc: HotelManagerService) {}

  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new hotel manager account' })
  async signUp(@Body() dto: AdminSignUpDto, @Req() req: Request) {
    const result = await this.svc.adminSignUp(dto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }
}
