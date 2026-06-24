import { IsString, IsInt, IsOptional, Min, IsArray } from 'class-validator';

export class UpdateMenuItemDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) priceCents?: number;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsInt() @Min(0) prepMinutes?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}
