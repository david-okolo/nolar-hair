import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    bookingReference: string

    @Column({
        type: 'varchar'
    })
    authorizationUrl: string

    @Column({
        type: 'int'
    })
    amount: number
    
    @Column({
        type: 'boolean',
        default: false
    })
    success: boolean

    @Column({
        type: 'boolean',
        default: false
    })
    verified: boolean
}