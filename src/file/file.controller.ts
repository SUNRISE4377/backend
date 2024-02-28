import { GetUserIdByToken } from '@/decorators/GetUserIdByToken'
import { JwtAuthGuard } from '@/guard/jwt-auth.guard'
import SerializerInterceptor from '@/interceptors/Serializer.interceptor'
import {
	BadRequestException,
	Controller,
	InternalServerErrorException,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { File } from './entities/file.entity'
import { FileService } from './file.service'
import { fileStorage } from './storage'

@Controller('file')
export class FileController {
	constructor(private readonly fileService: FileService) {}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(SerializerInterceptor(File))
	@UseInterceptors(
		FileInterceptor('file', {
			storage: fileStorage,
		}),
	)
	@Post()
	async create(
		@UploadedFile() file: Express.Multer.File,
		@GetUserIdByToken() userId: string,
	) {
		try {
			const foundFile = await this.fileService.findByFileName(file.filename)

			if (!!foundFile) {
				throw new BadRequestException('Such a file already exists.')
			}

			const createdFile = await this.fileService.create(userId, file)

			if (!createdFile) {
				throw new BadRequestException('Failed to create file.')
			}

			return createdFile
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}
}
