import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Mirrors the frontend's GuestInfo shape (lib/types.ts). Onboarding writes it
 * to GuestStay; the values inform downstream services (room search,
 * activity recommendations, dietary needs in room-service).
 */

export enum MealPlanDto {
  ROOM_ONLY = 'room-only',
  BREAKFAST = 'breakfast',
  HALF_BOARD = 'half-board',
  FULL_BOARD = 'full-board',
}

export class GuestInfoDto {
  @ApiProperty() @IsDateString() checkIn!: string;
  @ApiProperty() @IsDateString() checkOut!: string;
  @ApiProperty() @IsInt() @Min(1) nights!: number;
  @ApiProperty() @IsInt() @Min(1) adults!: number;
  @ApiProperty() @IsInt() @Min(0) children!: number;

  @ApiProperty({ required: false }) @IsOptional() @IsString() roomPreference?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() bedPreference?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() floorPreference?: string;

  @ApiProperty({ enum: MealPlanDto }) @IsEnum(MealPlanDto) mealPlan!: MealPlanDto;

  @ApiProperty({ required: false, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  specialRequests?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(20)
  @Type(() => String)
  itineraryVibes!: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(20)
  @Type(() => String)
  dietaryRestrictions!: string[];
}
