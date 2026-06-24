import { IsString, IsIn } from 'class-validator';

export class UpdateInvoiceStatusDto {
  @IsString()
  @IsIn(['DRAFT', 'ISSUED', 'PAID', 'VOID', 'CANCELLED'])
  status!: string;
}
