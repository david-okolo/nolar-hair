import { Injectable, Logger, Scope } from '@nestjs/common';
import winston, { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf } = format;

@Injectable({
    scope: Scope.TRANSIENT
})
export class LoggerService extends Logger {

    logger: winston.Logger;
    constructor() {
        super();
        this.logger = winston.createLogger({
            format: combine(
                timestamp(),
                printf(({level, message, timestamp}) => {
                    return `${timestamp} - ${level.toUpperCase} - ${message}`
                })
            ),
            transports: [
                new DailyRotateFile({
                    dirname: './logs',
                    filename: '%DATE%.error.log'
                })
            ]
        });
    }
    error(message: string, trace: string) {
        this.logger.error(message)
        super.error(message, trace);
    }
}
