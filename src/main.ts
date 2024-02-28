import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import * as express from 'express'
import { join } from 'path'

import { AppModule } from './app.module'

const PORT = process.env.PORT || 5000

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	)

	app.setGlobalPrefix('api')

	app.use(cookieParser())

	app.use('/uploads', express.static(join(__dirname, '..', 'uploads')))

	app.enableCors({ credentials: true, origin: true })

	await app.listen(PORT)
}

bootstrap()
