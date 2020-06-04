import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        private logger: LoggerService
    ) {}


    async getUserByUsername(username: string): Promise<null|User>  {
        const user = await this.userRepository.findOne({
            where: {
                username
            }
        }).catch(e => {
            throw e;
        });

        return user ? user : null;
    }

    async createNewUser(createUser: any): Promise<boolean> {

        const exists = await this.userRepository.findOne({
            where: {
                username: createUser.username
            }
        }).catch(e => {
            this.logger.error(e.message, e.stack)
        });

        if(exists) {
            throw new Error('Username already exists');
        }

        const user = await this.userRepository.insert(createUser).catch(e => {
            this.logger.error(e.message, e.stack)
            throw e;
        })

        return true;
    }
}
