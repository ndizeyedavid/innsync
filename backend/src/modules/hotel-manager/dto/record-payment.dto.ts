import { IsString, IsInt, IsIn, IsOptional, Min } from 'class-validator';

export class RecordPaymentDto {
  @IsInt()
  @Min(1)
  amountCents!: number;

  @IsString()
  @IsIn(['cash', 'card_swiped', 'bank_transfer', 'other'])
  method!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  invoiceId?: string;

  @IsString()
  @IsOptional()
  currency?: string;
}
