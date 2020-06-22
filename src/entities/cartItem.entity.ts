import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { Product } from './product.entity';
import { StoreTransaction } from './storeTransaction.entity';

@Entity()
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: true})
    productId: number

    @ManyToOne(type => Product, product => product.cartItems)
    product: Product

    @ManyToOne(type => StoreTransaction, storeTransaction => storeTransaction.cartItems)
    storeTransaction: StoreTransaction

    @Column()
    count: number
}