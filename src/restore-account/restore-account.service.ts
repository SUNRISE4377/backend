import { JwtService } from '@/jwt/jwt.service'
import { OtpService } from '@/otp/otp.service'
import { UserService } from '@/user/user.service'
import { getHTMLForOTP } from '@/utils/getHTMLForOTP'
import { MailerService } from '@nestjs-modules/mailer'
import { BadRequestException, Injectable } from '@nestjs/common'
import { RestoreAccountDto } from './dto/restore-account.dto'
import { VerificationOtpDto } from './dto/verification-otp.dto'

@Injectable()
export class RestoreAccountService {
	constructor(
		private readonly otpService: OtpService,
		private readonly mailerService: MailerService,
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
	) {}

	async createOtp({ email }: RestoreAccountDto) {
		const foundOtp = await this.otpService.findbyEmail(email)

		if (foundOtp) {
			const otp = await this.otpService.generateOtp()

			foundOtp.otp = otp

			await foundOtp.save()

			await this.sendOtpToEmail(otp, email)

			return otp
		}

		const createdOtp = await this.otpService.create({ email })

		await this.sendOtpToEmail(createdOtp.otp, email)

		return createdOtp.otp
	}

	async sendOtpToEmail(otp: number, email: string) {
		const sentMessageInfo = await this.mailerService.sendMail({
			to: email,
			from: process.env.NODEMAILER_USER,
			subject: 'TaskFlow account restore.',
			html: getHTMLForOTP(otp),
		})

		return sentMessageInfo
	}

	async verificationOtp({ email, otp }: VerificationOtpDto) {
		const foundOtp = await this.otpService.findbyOtp(otp)

		if (!foundOtp || foundOtp.email !== email) {
			throw new BadRequestException('Failed to find OTP.')
		}

		const foundUser = await this.userService.findByEmail(email)

		const userId = foundUser._id.toString()

		const accessToken = this.jwtService.getAccessToken({
			userId,
		})

		const deleteResult = await this.otpService.removeByOtp(otp)

		return {
			accessToken,
		}
	}
}
