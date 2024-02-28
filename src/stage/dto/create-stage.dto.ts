import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Types } from 'mongoose'

export class CreateStageDto {
	@IsString()
	@IsNotEmpty()
	name: string

	@IsString()
	@IsNotEmpty()
	boardId: string | Types.ObjectId

	@IsOptional()
	@IsString()
	tasks?: string[]
}
