import { IsDateString, IsOptional, IsString } from 'class-validator';

export class IssueKeyDto {
  @IsString() stayId!: string;
  @IsString() externalRoomId!: string;
  @IsDateString() expiresAt!: string;
  @IsOptional() @IsString() pin?: string;
}
