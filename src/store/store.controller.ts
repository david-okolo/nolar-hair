import { Controller, Get, Post, UseGuards, Body, UseInterceptors, UploadedFile, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { CreateProductDto } from './dto/createProduct.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerStorage, imageFileFilter } from '../lib/utils/storage';

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
            data: {
                products: productList
            }
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
            imageUrl: file.path
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
