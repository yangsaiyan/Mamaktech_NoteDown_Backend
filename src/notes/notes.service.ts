import { Injectable, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/notes.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/users.entity';
import { CreateBulkNotesDto } from './dto/create-bulk-notes.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private getUserIdFromToken(token: string): number {
    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      
      if (!userId) {
        throw new UnauthorizedException('Invalid token payload');
      }
      
      return userId;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async saveBulkNotes(notesArray: CreateNoteDto[], token: string): Promise<Note[]> {
    console.log('Notes received in service:', notesArray);
    const userId = this.getUserIdFromToken(token);
    console.log('User ID from token:', userId);
    
    await this.notesRepository.delete({ userId });
    console.log('Deleted existing notes for user');
    
    const notes = notesArray.map(noteDto => {
      const note = this.notesRepository.create({
        ...noteDto,
        userId
      });
      console.log('Created note:', note);
      return note;
    });
    
    try {
      const savedNotes = await this.notesRepository.save(notes);
      console.log('Successfully saved notes:', savedNotes.length);
      return savedNotes;
    } catch (error) {
      console.error('Error saving notes:', error);
      throw error;
    }
  }

  async findAll(token: string): Promise<Note[]> {
    const userId = this.getUserIdFromToken(token);
    
    return this.notesRepository.find({ where: { userId } });
  }

  async findOne(token: string): Promise<Note> {
    const userId = this.getUserIdFromToken(token);
    
    const note = await this.notesRepository.findOne({ where: { userId } });
    if (!note) {
      throw new NotFoundException('Note not found for this user');
    }
    
    return note;
  }

  async remove(token: string): Promise<void> {
    const userId = this.getUserIdFromToken(token);
    
    const note = await this.notesRepository.findOne({ where: { userId } });
    if (!note) {
      throw new NotFoundException('Note not found for this user');
    }
    
    await this.notesRepository.delete(note.id);
  }
}