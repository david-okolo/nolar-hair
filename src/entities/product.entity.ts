import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { StoreCategory } from './storeCategory.entity';
import { CartItem } from './cartItem.entity';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    price: number

    @Column()
    imageUrl: string

    @Column({
        default: 0
    })
    discount: number

    @Column()
    count: number

    @ManyToOne(type => StoreCategory, storeCategory => storeCategory.products)
    storeCategory: StoreCategory

    @OneToMany(type => CartItem, cartItem => cartItem.product)
    cartItems: CartItem[]
}