import { PartialType } from '@nestjs/mapped-types'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { CreateStageDto } from './create-stage.dto'

export class UpdateStageDto extends PartialType(CreateStageDto) {
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	tasks?: string[]

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	name?: string
}
