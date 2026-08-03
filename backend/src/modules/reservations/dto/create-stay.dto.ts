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
import { MealPlanDto } from 'src/modules/guests/dto/guest-info.dto';

/**
 * The guest-info form on the frontend submits one of these to create a draft
 * stay. The stay sits in PENDING until check-in, at which point we provision
 * an upstream HMS reservation.
 */
export class CreateStayDto {
  @ApiProperty() @IsDateString() checkIn!: string;
  @ApiProperty() @IsDateString() checkOut!: string;
  @ApiProperty() @IsInt() @Min(1) nights!: number;
  @ApiProperty() @IsInt() @Min(1) adults!: number;
  @ApiProperty() @IsInt() @Min(0) children!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() hotelId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() roomPreference?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() bedPreference?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() floorPreference?: string;
  @ApiProperty({ enum: MealPlanDto, required: false })
  @IsOptional()
  @IsEnum(MealPlanDto)
  mealPlan?: MealPlanDto;
  @ApiProperty({ required: false, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  specialRequests?: string;
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @Type(() => String)
  itineraryVibes?: string[];
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @Type(() => String)
  dietaryRestrictions?: string[];
}
