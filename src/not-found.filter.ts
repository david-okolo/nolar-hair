import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { resolve } from 'path';

@Catch()
export class NotFoundFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    response.sendFile(resolve('./public/index.html'))
  }
}
