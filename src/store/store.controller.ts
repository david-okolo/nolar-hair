import { Controller, Get, Post, UseGuards, Body, UseInterceptors, UploadedFile, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { CreateProductDto } from './dto/createProduct.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerStorage, imageFileFilter } from '../lib/utils/storage';
import { BuyProductsDto } from './dto/buyproducts.dto';

@Controller('store')
export class StoreController {

    constructor(
        private storeService: StoreService
    ) {}

    @Get('list')
    async getAll() {
        const productList = await this.storeService.findAll();

        return {
            success: true,
            message: 'Product list successfully fetched',
            data: productList
        }
    }

    @Post('pay')
    async getLink(@Body() body: BuyProductsDto) {
        const data = await this.storeService.buyProducts(body);

        return {
            success: true,
            message: 'Cart Payment Initialized',
            data
        }
    }

    @Post('verify')
    async verifyPayment(@Body() body: any) {
        const result = await this.storeService.verify(body.reference);

        return {
            success: result.verified,
            status: result.status,
            message: result.verified ? 'Payment Successful' : 'Payment Not Successful',
            ...result.errors.length > 0 && {errors: result.errors}
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('add')
    @UseInterceptors(FileInterceptor('productImage', {
        storage: multerStorage,
        fileFilter: imageFileFilter
    }))
    async addProducts(@UploadedFile() file, @Body() newProduct: CreateProductDto) {
        const { imageUrl, ...rest } = newProduct;
        const created = await this.storeService.createProduct({
            ...rest,
            imageUrl: file.path.substr(6) //removes the public
        })

        if (!created) {
            throw new InternalServerErrorException();
        }

        return {
            success: true,
            message: 'Successfully created'
        }
    }

}
