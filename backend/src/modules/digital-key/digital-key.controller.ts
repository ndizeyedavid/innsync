import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { DigitalKeyMethod, DigitalKeyResult } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { DigitalKeyService } from './digital-key.service';

class IssueKeyDto {
  @IsString() stayId!: string;
  @IsString() externalRoomId!: string;
  @IsDateString() expiresAt!: string;
  @IsOptional() @IsString() pin?: string;
}

class UnlockDto {
  @IsString() digitalKeyId!: string;
  @IsEnum(DigitalKeyMethod) method!: DigitalKeyMethod;
  @IsEnum(DigitalKeyResult) result!: DigitalKeyResult;
}

class VerifyPinDto {
  @IsString() digitalKeyId!: string;
  @IsString() pin!: string;
}

@ApiTags('digital-key')
@ApiBearerAuth()
@Controller('digital-key')
export class DigitalKeyController {
  constructor(private readonly keys: DigitalKeyService) {}

  @Post('issue')
  @ApiOperation({ summary: 'Request a digital key for a stay' })
  issue(@CurrentUser() user: AuthenticatedUser, @Body() dto: IssueKeyDto) {
    return this.keys.issue(user.sub, dto.stayId, dto.externalRoomId, new Date(dto.expiresAt), dto.pin);
  }

  @Post('unlock')
  unlock(@CurrentUser() user: AuthenticatedUser, @Body() dto: UnlockDto) {
    return this.keys.recordUnlock(user.sub, dto.digitalKeyId, dto.method, dto.result);
  }

  @Post('verify-pin')
  async verifyPin(@CurrentUser() user: AuthenticatedUser, @Body() dto: VerifyPinDto) {
    const ok = await this.keys.verifyPin(user.sub, dto.digitalKeyId, dto.pin);
    return { ok };
  }
}
