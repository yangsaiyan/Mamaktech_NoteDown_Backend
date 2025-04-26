import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying', length: 255, nullable: true })
  title: string;

  @Column({ type: 'character varying', length: 255, nullable: true })
  subtitle: string;

  @Column({ type: 'character varying', length: 50, nullable: false })
  date_time: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  is_pinned: boolean;

  @Column({ type: 'json', nullable: false })
  note_content_list: any;

  @Column({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  created_at: Date;

  @Column({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updated_at: Date;

  @Column({
    type: 'int',
    nullable: false,
  })
  userId: number;

  @Column({ type: 'int', nullable: true })
  position: number;
}
