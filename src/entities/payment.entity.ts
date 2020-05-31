import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Booking } from "./booking.entity";

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    reference: string

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

    @Column({nullable: true})
    bookingId: number

    @OneToOne(type => Booking, booking => booking.payment)
    @JoinColumn()
    booking: Booking
}