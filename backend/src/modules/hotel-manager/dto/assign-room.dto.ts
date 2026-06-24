import { IsString } from 'class-validator';

export class AssignRoomDto {
  @IsString()
  roomId!: string;
}
