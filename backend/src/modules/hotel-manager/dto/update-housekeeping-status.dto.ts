import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum HousekeepingStatus {
  CLEAN = 'clean',
  DIRTY = 'dirty',
  IN_PROGRESS = 'in_progress',
  MAINTENANCE = 'maintenance',
}

export class UpdateHousekeepingStatusDto {
  @IsEnum(HousekeepingStatus)
  status!: HousekeepingStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}
