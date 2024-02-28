import {
	Controller,
	ForbiddenException,
	InternalServerErrorException,
	Post,
	Req,
} from '@nestjs/common'
import { Request } from 'express'
import { JwtService } from './jwt.service'

@Controller('jwt')
export class JwtController {
	constructor(private readonly jwtService: JwtService) {}

	@Post('token')
	async getNewAccessToken(@Req() req: Request) {
		try {
			const refreshToken = req.cookies['refreshToken']

			const { isValid, data } = await this.jwtService.validateToken(
				refreshToken,
				'refresh',
			)

			if (!isValid) {
				throw new ForbiddenException('The token is invalid.')
			}

			const accessToken = await this.jwtService.getAccessToken(data)

			return { accessToken }
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}
}
