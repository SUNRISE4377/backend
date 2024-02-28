import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator'

export class RegistrationDto {
	@IsEmail()
	email: string

	@IsString()
	@IsNotEmpty()
	userName: string

	@IsString()
	@MinLength(8)
	@MaxLength(32)
	password: string

	@IsOptional()
	@IsString()
	firstName?: string

	@IsOptional()
	@IsString()
	lastName?: string
}
