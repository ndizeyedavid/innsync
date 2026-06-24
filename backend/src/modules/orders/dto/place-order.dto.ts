import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderCategory } from '@prisma/client';

export class OrderItemInputDto {
  @ApiProperty()
  @IsString()
  externalMenuItemId!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ required: false, maxLength: 240 })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  note?: string;
}

export class PlaceOrderDto {
  @ApiProperty()
  @IsString()
  stayId!: string;

  @ApiProperty({ enum: OrderCategory })
  @IsEnum(OrderCategory)
  category!: OrderCategory;

  @ApiProperty({ type: [OrderItemInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items!: OrderItemInputDto[];

  @ApiProperty({ required: false, maxLength: 480 })
  @IsOptional()
  @IsString()
  @MaxLength(480)
  notes?: string;
}
