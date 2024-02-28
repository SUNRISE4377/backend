import { PartialType } from '@nestjs/mapped-types'
import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator'
import { CreateBoardDto } from './create-board.dto'

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@ArrayMinSize(1)
	stages?: string[]
}
