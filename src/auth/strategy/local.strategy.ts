import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { UnauthorizedException, Injectable } from "@nestjs/common";
import { LoggerService } from "../../logger/logger.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private authService: AuthService,
        private logger: LoggerService
        ) {
        super();
    }

    async validate(username: string, pass: string) {

        const user = await this.authService.validateUser(username, pass).catch(e => {
            this.logger.error(e.message, e.stack);
        })

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}