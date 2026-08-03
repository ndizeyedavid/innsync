import { IsString, IsInt, IsOptional, Min, IsArray } from 'class-validator';

export class CreateMenuItemDto {
  @IsString() name!: string;
  @IsString() category!: string;
  @IsString() @IsOptional() description?: string;
  @IsInt() @Min(0) priceCents!: number;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsInt() @Min(0) prepMinutes?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}
