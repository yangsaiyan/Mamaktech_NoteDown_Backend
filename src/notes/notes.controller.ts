import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './entities/notes.entity';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post('/getNote')
  async getMyNote(@Headers('authorization') token: string): Promise<Note> {
    return this.notesService.findOne(token);
  }

  @Get('/getAllNotes')
  async getMyAllNotes(
    @Headers('authorization') token: string,
  ): Promise<Note[]> {
    return this.notesService.findAll(token);
  }

  @Post('/uploadAllNotes')
  @HttpCode(HttpStatus.CREATED)
  async createOrUpdateAllNotes(
    @Body() notesArray: CreateNoteDto[],
    @Headers('authorization') token: string,
  ): Promise<Note[]> {
    return this.notesService.saveBulkNotes(notesArray, token);
  }
}
