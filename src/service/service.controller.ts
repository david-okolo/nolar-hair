import { Controller, Get, Post, Body } from '@nestjs/common';
import { ServiceService } from './service.service';
import { LoggerService } from '../logger/logger.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Controller('service')
export class ServiceController {

    constructor(
        private serviceService: ServiceService,
        private logger: LoggerService
    ) {}

    @Get('all')
    async getAll() {
        const response = {
            success: false,
            message: 'Failed to fetch services',
            data: {
                services: []
            },
            errors: []
        }
        const data = await this.serviceService.findAll().catch(e => {
            this.logger.error(e.message, e.stack)
            throw e;
        });

        if(data) {
            response.success = true;
            response.message = 'Services successfully fetched';
            response.data.services = data
        }

        return response;
    }

    @Post('create')
    async createNewService(@Body() createServiceDto: CreateServiceDto) {
        const response = {
            success: false,
            message: 'Failed to create service',
            errors: []
        }

        const data = await this.serviceService.create(createServiceDto.serviceName).catch(e => {
            this.logger.error(e.message, e.stack);
            throw e;
        });

        if (data.status) {
            response.success = true;
            response.message = 'Service successfully created';
        } else {
            response.errors = data.errors
        }

        return response;
    }
}
