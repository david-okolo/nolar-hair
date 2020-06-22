import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Product } from './product.entity';

@Entity()
export class StoreCategory {
    @PrimaryGeneratedColumn()
    id: string

    @Column({
        type: 'varchar',
        unique: true
    })
    categoryName: string

    @OneToMany(type => Product, product => product.storeCategory)
    products: Product[]
}