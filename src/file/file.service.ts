import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { File, TFile } from './entities/file.entity'

@Injectable()
export class FileService {
	constructor(
		@InjectModel(File.name) private readonly fileModel: Model<File>,
	) {}

	async create(userId: string, file: Express.Multer.File) {
		const createdFile = await this.fileModel.create({
			fileName: file.filename,
			mimetype: file.mimetype,
			originalName: file.originalname,
			size: file.size,
			userId,
		})

		return createdFile
	}

	async findByFileName(fileName: string) {
		const foundFile = await this.fileModel.findOne({ fileName })

		return foundFile
	}

	async findByUserId(userId: string) {
		const foundFile = await this.fileModel.find({ userId })

		return foundFile
	}

	async findById(id: string) {
		const foundFile = await this.fileModel.findById({ _id: id })

		return foundFile
	}

	formatMultipleFiles(fileModels: TFile[]) {
		const formatedFiles = fileModels.map(file => ({
			id: file._id,
			fileName: file.fileName,
			originalName: file.originalName,
		}))

		return formatedFiles
	}
}
