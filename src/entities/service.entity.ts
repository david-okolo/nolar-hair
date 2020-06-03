import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Service {
    @PrimaryGeneratedColumn()
    id: string

    @Column({
        type: 'varchar',
        unique: true
    })
    serviceName: string
}