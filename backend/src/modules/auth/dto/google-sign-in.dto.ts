import { IsString, IsOptional } from 'class-validator';

export class GoogleSignInDto {
  @IsString()
  idToken!: string;

  @IsOptional()
  @IsString()
  deviceLabel?: string;
}
