// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  // HAPUS SEMUA 'setGlobalPrefix' DAN 'useStaticAssets' DARI SINI.
  // Nginx sudah menangani semua rute.

  // NestJS HANYA perlu berjalan di localhost (127.0.0.1)
  // agar bisa didengar oleh Nginx. Ini lebih aman.
  await app.listen(3000, '127.0.0.1');
}
bootstrap();