export class BuyProductsDto {
  name: string
  email: string
  selectedProducts: Array<{
    count: number
    id: number
  }>
}