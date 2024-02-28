import { IsNotEmpty, IsString } from 'class-validator'
import { Types } from 'mongoose'

export class CreateJwtDto {
	@IsString()
	@IsNotEmpty()
	userId: string | Types.ObjectId
}
