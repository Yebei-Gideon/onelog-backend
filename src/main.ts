// src/main.ts
import { AppModule, ObserveInstrument } from '#app.module.js'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

const logger = new Logger('main.ts')

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  })

  // Global DTO Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })

  app.setGlobalPrefix('api')

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:1420',
      'http://127.0.0.1:1420',
      'tauri://localhost',
      'http://tauri.localhost',
      'https://tauri.localhost',
      'https://onelog-theta.vercel.app',
      process.env.FRONTEND_URL ?? 'http://localhost:3000',
      (process.env.ALLOWED_ORIGINS ?? '').split(',').map((origin) => origin.trim()),
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  const port = process.env.PORT ?? 4000
  await app.listen(port)
  logger.log(`Application listening at: http://localhost:${port}/api/v1`)
}

await bootstrap()
