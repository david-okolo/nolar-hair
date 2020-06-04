import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService
    ) {}

    async validateUser(username:string, pass: string) {
        const user = await this.userService.getUserByUsername(username);

        if (!user) {
            return null;
        }

        const passwordIsValid = await bcrypt.compare(pass, user.password);

        if (!passwordIsValid) {
            return null;
        }

        const { password, ...rest } = user;

        return rest;

    }

    login(user: any) {
        return this.jwtService.sign({
            username: user.username,
            sub: user.id
        }); 
    }

    async register(user: any) {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        return await this.userService.createNewUser({
            username: user.username,
            password: hashedPassword
        })
    }
}
