// src/notes/dto/create-bulk-notes.dto.ts
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateNoteDto } from './create-note.dto';

export class CreateBulkNotesDto {
  notes: CreateNoteDto[];
}