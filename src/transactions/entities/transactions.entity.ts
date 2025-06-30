import { Account } from "../../accounts/entities/accounts.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    accountId: string;

    @ManyToOne(() => Account)
    @JoinColumn({ name: 'accountId' })
    account: Account;

    @Column({ type: 'decimal' })
    amount: number;

    @Column({ type: 'enum', enum: ['DEPOSIT', 'WITHDRAWAL'] })
    type: 'DEPOSIT' | 'WITHDRAWAL';

    @CreateDateColumn()
    createdAt: Date;
}
