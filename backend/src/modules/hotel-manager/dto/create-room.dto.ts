import { IsString, IsInt, IsOptional, Min, IsArray } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  number!: string;

  @IsString()
  type!: string;

  @IsInt()
  @Min(0)
  priceCents!: number;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsString()
  status?: string;
}
