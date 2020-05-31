import { Entity, PrimaryGeneratedColumn, Column, Generated, OneToOne } from "typeorm";
import { Payment } from "./payment.entity";

@Entity()
export class Booking {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Generated('uuid')
    reference: string

    @Column({ type: 'varchar'})
    name: string

    @Column({ type: 'varchar' })
    email: string

    @Column({ type:  'int' })
    appointmentTime: number

    @Column({ type: 'varchar' })
    service: string

    @Column({ type: 'boolean', default: false })
    paid: boolean

    @OneToOne(type => Payment, payment => payment.booking)
    payment: Payment
}