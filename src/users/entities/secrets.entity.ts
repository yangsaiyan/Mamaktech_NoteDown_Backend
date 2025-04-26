import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "secrets", schema: "notedown" })
export class Secret {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "text", nullable: false})
    secret: string;
}