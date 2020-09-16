import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Token extends BaseEntity {
    @PrimaryGeneratedColumn()
    id! : number;

    @CreateDateColumn()
    createdAt: Date

    @CreateDateColumn()
    updatedAt: Date

    @Column()
    token! : string
}