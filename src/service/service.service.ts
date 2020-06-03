import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from '../entities/service.entity';
import { Repository, InsertResult } from 'typeorm';

@Injectable()
export class ServiceService {
    constructor(
        @InjectRepository(Service) private serviceRepository: Repository<Service>
    ) {}

    async findAll(): Promise<Service[]> {
        return await this.serviceRepository.find();
    }

    async create(serviceName: string) {

        const res = {
            status: false,
            errors: []
        };

        const service = await this.serviceRepository.find({ where: { serviceName } });

        if (service.length === 0) {
            const insertRes: InsertResult = await this.serviceRepository.insert({
                serviceName
            });
            console.log(insertRes);
            res.status = true;
            return res;
        } else {
            res.errors.push('Service already exists')
        }

        return res;
    }
}
