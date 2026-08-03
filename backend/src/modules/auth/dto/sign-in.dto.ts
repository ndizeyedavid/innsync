import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'guest@innsync.dev' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+15555550100', required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ required: false, description: 'Optional device label for session listing' })
  @IsOptional()
  @IsString()
  deviceLabel?: string;
}
