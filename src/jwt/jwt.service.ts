import { UserService } from '@/user/user.service'
import { EVariantGetData, getDataByToken } from '@/utils/getDataByToken'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as jwt from 'jsonwebtoken'
import { Model, Types } from 'mongoose'
import { CreateJwtDto } from './dto/create-jwt.dto'
import { Jwt } from './entities/jwt.entity'
import { IDataToken } from './types'

@Injectable()
export class JwtService {
	constructor(
		@InjectModel(Jwt.name) private jwtModel: Model<Jwt>,
		private readonly userService: UserService,
	) {}

	async create(createJwtDto: CreateJwtDto) {
		const refreshToken = await this.generateRefreshToken(createJwtDto)
		const accessToken = this.getAccessToken(createJwtDto)

		return {
			refreshToken,
			accessToken,
		}
	}

	async findByUserId(userId: string | Types.ObjectId) {
		const foundToken = await this.jwtModel.findOne({ userId })

		return foundToken
	}

	getAccessToken(payload: IDataToken): string {
		const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
			expiresIn: 30 * 60, // 30m
		})

		return accessToken
	}

	private getRefreshToken(payload: IDataToken) {
		const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
			expiresIn: 30 * 24 * 60 * 60, // 30d
		})

		return refreshToken
	}

	async generateRefreshToken(payload: IDataToken) {
		const foundToken = await this.findByUserId(payload.userId)

		if (foundToken) {
			const token = this.getRefreshToken(payload)

			foundToken.refreshToken = token

			await foundToken.save()

			return token
		}

		const refreshToken = this.getRefreshToken(payload)

		const createdToken = await this.jwtModel.create({
			refreshToken,
			userId: payload.userId,
		})

		return createdToken.refreshToken
	}

	async validateToken(
		token: string,
		variant: `${EVariantGetData}`,
	): Promise<{
		isValid: boolean
		data: IDataToken | null
	}> {
		const { userId } = getDataByToken(token, variant)

		const foundUser = await this.userService.findById(userId)

		const isUserExist = !!foundUser && foundUser.isActivated

		if (!isUserExist) {
			return {
				isValid: false,
				data: null,
			}
		}

		const dataToken: IDataToken = { userId }

		return {
			isValid: true,
			data: dataToken,
		}
	}
}
