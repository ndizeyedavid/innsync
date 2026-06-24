import { IsEmail, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class AdminSignUpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'password too weak' })
  password!: string;
}
