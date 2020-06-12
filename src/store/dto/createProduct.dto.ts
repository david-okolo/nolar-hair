export class CreateProductDto {
    name: string
    price: number
    imageUrl: string
    discount?: number
    count?: number
}