import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

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
}