import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "users", schema: "notedown" })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int", nullable: false, array: true })
    secret: number[];
}