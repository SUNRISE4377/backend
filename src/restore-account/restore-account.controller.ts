import { UserService } from '@/user/user.service'
import {
	BadRequestException,
	Body,
	Controller,
	InternalServerErrorException,
	Post,
} from '@nestjs/common'
import { RestoreAccountDto } from './dto/restore-account.dto'
import { VerificationOtpDto } from './dto/verification-otp.dto'
import { RestoreAccountService } from './restore-account.service'

@Controller('restore-account')
export class RestoreAccountController {
	constructor(
		private readonly restoreAccountService: RestoreAccountService,
		private readonly userService: UserService,
	) {}

	@Post()
	async createOtp(@Body() restoreAccountDto: RestoreAccountDto) {
		try {
			const foundUser = await this.userService.findByEmail(
				restoreAccountDto.email,
			)

			if (!foundUser?.isActivated) {
				throw new BadRequestException('The user could not be found.')
			}

			const createdOtp = await this.restoreAccountService.createOtp(
				restoreAccountDto,
			)

			return { success: true }
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}

	@Post('verification')
	async verificationOtp(@Body() verificationOtpDto: VerificationOtpDto) {
		try {
			const { accessToken } = await this.restoreAccountService.verificationOtp(
				verificationOtpDto,
			)

			return { accessToken }
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}
}
