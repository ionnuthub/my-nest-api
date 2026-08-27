import 'dotenv/config';
import {ValidationPipe} from "@nestjs/common";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from "@nestjs/config";
import {AllExceptionsFilter} from "./common/filters/all-exceptions/all-exceptions.filter";
import {TransformInterceptor} from "./common/interceptors/transform/transform.interceptor";


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
  );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    const configService = app.get(ConfigService);

    const port = configService.get<number>('PORT') ?? 3000;

    await app.listen(port);

}
bootstrap();
