import { Injectable, NestMiddleware } from '@nestjs/common';
import { resolve } from 'path';

@Injectable()
export class FrontendMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    res.sendFile(resolve('../public/index.html'))
  }
}
