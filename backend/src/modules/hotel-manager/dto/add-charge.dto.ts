import { IsString, IsInt, IsOptional, Min, MaxLength } from 'class-validator';

export class AddChargeDto {
  @IsInt()
  @Min(1)
  amountCents!: number;

  @IsString()
  @MaxLength(300)
  description!: string;

  @IsOptional()
  @IsString()
  category?: string;
}
