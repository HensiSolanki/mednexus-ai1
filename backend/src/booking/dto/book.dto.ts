import { IsEmail, IsString } from 'class-validator';

export class BookDto {
  @IsString()
  slotId!: string;

  @IsEmail()
  patientEmail!: string;
}
