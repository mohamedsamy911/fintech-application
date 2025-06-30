import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Account {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'decimal', default: 0 })
    balance: number;

    @CreateDateColumn()
    createdAt: Date;
}
