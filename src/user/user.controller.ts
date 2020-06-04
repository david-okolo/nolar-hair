import { Controller, Body, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(
        private userService: UserService
    ) {}

    @Get()
    async getUser(@Body() user: any) {
        return await this.userService.getUserByUsername(user.username);
    }
}
