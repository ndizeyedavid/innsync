import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { UsersService } from './users.service';

class UpdateGuestProfileDto {
  @IsOptional() @IsArray() @IsString({ each: true })
  dietaryRestrictions?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  preferredVibes?: string[];

  @IsOptional() @IsString() @MaxLength(10)
  preferredLanguage?: string;

  @IsOptional() @IsString() @MaxLength(3)
  preferredCurrency?: string;
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('me')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.users.findById(user.sub);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update guest profile preferences' })
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateGuestProfileDto) {
    return this.users.updateGuestProfile(user.sub, dto);
  }

  @Get('sessions')
  listSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.users.listSessions(user.sub);
  }

  @Delete('sessions/:id')
  revokeSession(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.users.revokeSession(user.sub, id);
  }
}
