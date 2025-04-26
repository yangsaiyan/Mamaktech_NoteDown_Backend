import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class CreateNoteDto {
  title?: string;
  subtitle?: string;
  date_time: string;
  is_pinned?: boolean;
  note_content_list: any;
  userId?: number;
  position?: number;
}
