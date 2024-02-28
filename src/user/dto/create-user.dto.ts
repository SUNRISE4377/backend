import { Type } from 'class-transformer'
import {
	IsArray,
	IsBoolean,
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
	ValidateNested,
} from 'class-validator'

class Url {
	@IsString()
	@IsNotEmpty()
	value: string
}

export class CreateUserDto {
	@IsEmail()
	email: string

	@IsString()
	@IsNotEmpty()
	userName: string

	@IsString()
	@MinLength(8)
	@MaxLength(32)
	password: string

	@IsString()
	avatar?: string

	@IsString()
	firstName?: string

	@IsString()
	lastName?: string

	@IsBoolean()
	isActivated?: boolean

	@IsString()
	@IsNotEmpty()
	activationKey?: string

	@IsOptional()
	@IsString()
	bio?: string

	@IsOptional()
	@IsString()
	birthday?: string

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => Url)
	urls?: { value: string }[]
}
