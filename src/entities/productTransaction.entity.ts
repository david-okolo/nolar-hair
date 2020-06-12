import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Generated } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class ProductTransaction {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    email: string

    @Column()
    unitPrice: number

    @Column()
    amount: number

    @Generated('uuid')
    reference: string

    @ManyToOne(type => Product)
    product: Product

}