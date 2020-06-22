import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Generated, ManyToMany, JoinTable, OneToOne, OneToMany, JoinColumn } from "typeorm";
import { Product } from "./product.entity";
import { CartItem } from './cartItem.entity';
import { Payment } from './payment.entity';

@Entity()
export class StoreTransaction {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    email: string

    @Column()
    amount: number

    @Column({ default: 0 })
    amountPaid: number

    @Column({ default: 0 })
    amountRefunded: number

    @Column( { default: null })
    refundStatus: string

    @Column()
    @Generated('uuid')
    reference: string

    @Column({default: false})
    paid: boolean

    @OneToMany(type => CartItem, cartItem => cartItem.storeTransaction)
    cartItems: CartItem[]

    @OneToOne(type => Payment)
    @JoinColumn()
    payment: Payment

}