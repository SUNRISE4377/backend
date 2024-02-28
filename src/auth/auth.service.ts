import { JwtService } from '@/jwt/jwt.service'
import { UserService } from '@/user/user.service'
import { getHash } from '@/utils/getHash'
import { getHTMLForConfirmAccount } from '@/utils/getHTMLForConfirmAccount'
import { MailerService } from '@nestjs-modules/mailer'
import { BadRequestException, Injectable } from '@nestjs/common'
import { compare } from 'bcrypt'
import { v4 } from 'uuid'
import { LoginWithEmailDto } from './dto/loginWithEmail.dto'
import { LoginWithUserNameDto } from './dto/loginWithUserName.dto'
import { RegistrationDto } from './dto/registration.dto'

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly mailerService: MailerService,
		private readonly jwtService: JwtService,
	) {}

	async registration(registrationDto: RegistrationDto) {
		const foundUser = await this.userService.findByEmail(registrationDto.email)

		if (foundUser && foundUser.isActivated) {
			throw new BadRequestException('This user already exists.')
		}

		if (foundUser && !foundUser.isActivated) {
			await this.sendMailAccountActivation(
				registrationDto.email,
				foundUser.activationKey,
			)

			return
		}

		const passwordHash = await getHash(registrationDto.password)

		const activationKey = v4()

		await this.userService.create({
			...registrationDto,
			password: passwordHash,
			activationKey,
		})

		await this.sendMailAccountActivation(registrationDto.email, activationKey)
	}

	async loginWithEmail(loginDto: LoginWithEmailDto) {
		const foundUser = await this.userService.findByEmail(loginDto.email)

		if (!foundUser || !foundUser.isActivated) {
			throw new BadRequestException('Incorrect login or password.')
		}

		const isCorrectPassword = await compare(
			loginDto.password,
			foundUser.password,
		)

		if (!isCorrectPassword) {
			throw new BadRequestException('Incorrect login or password.')
		}

		const userId = foundUser._id.toString()

		const payload = { userId }

		const refreshToken = await this.jwtService.generateRefreshToken(payload)

		const accessToken = this.jwtService.getAccessToken(payload)

		return {
			refreshToken,
			accessToken,
		}
	}

	async loginWithUserName(loginDto: LoginWithUserNameDto) {
		const foundUser = await this.userService.findByUserName(loginDto.userName)

		if (!foundUser || !foundUser.isActivated) {
			throw new BadRequestException('Incorrect login or password.')
		}

		const isCorrectPassword = await compare(
			loginDto.password,
			foundUser.password,
		)

		if (!isCorrectPassword) {
			throw new BadRequestException('Incorrect login or password.')
		}

		const userId = foundUser._id.toString()

		const payload = { userId }

		const refreshToken = await this.jwtService.generateRefreshToken(payload)

		const accessToken = this.jwtService.getAccessToken(payload)

		return {
			refreshToken,
			accessToken,
		}
	}

	private async sendMailAccountActivation(
		email: string,
		activationKey: string,
	) {
		const API_URL = process.env.API_URL
		const activationLink = API_URL + '/api/activation/' + activationKey

		await this.mailerService.sendMail({
			to: email,
			from: process.env.NODEMAILER_USER,
			subject: 'TaskFlow Account Confirmation.',
			html: getHTMLForConfirmAccount(activationLink),
		})
	}

	async checkUserName(userName: string) {
		const foundUser = await this.userService.findByUserName(userName)

		return !!foundUser
	}
}
