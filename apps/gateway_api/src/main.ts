import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT;

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
  .addBearerAuth()
  .setTitle("Airways booking system")
  .setDescription("Airways Server")
  .setVersion("1.0.0")
  .addTag("Airways")
  .build();

const document = SwaggerModule.createDocument(app, swaggerConfig);
SwaggerModule.setup("docs", app, document);

  // await app.listen(4000);
  await app.listen(PORT, () =>
    console.log(`Server has been started on PORT: ${PORT}!`),
  );
}
bootstrap();
