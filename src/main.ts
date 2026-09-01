import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform/transform.interceptor';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Nest Users API')
        .setDescription('API pentru utilizatori și autentificare')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const documentFactory = () =>
        SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('docs', app, documentFactory, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });

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
