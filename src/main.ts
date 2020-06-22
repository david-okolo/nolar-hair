import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';
import { NotFoundFilter } from './not-found.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors()
  app.useLogger(LoggerService);
  // app.useGlobalFilters(new NotFoundFilter())
  app.useStaticAssets('public')
  app.setGlobalPrefix('api');

  await app.listen(3000);
}
bootstrap();
