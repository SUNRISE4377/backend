import { getOtp } from '@/utils/getOtp'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateOtpDto } from './dto/create-otp.dto'
import { Otp } from './entities/otp.entity'

@Injectable()
export class OtpService {
	constructor(
		@InjectModel(Otp.name)
		private readonly otpModel: Model<Otp>,
	) {}

	async create(createOtpDto: CreateOtpDto) {
		const { email } = createOtpDto

		const otp = await this.generateOtp()

		const createdOtp = await this.otpModel.create({
			email,
			otp,
		})

		return createdOtp
	}

	async findbyEmail(email: string) {
		const foundOtp = await this.otpModel.findOne({ email })

		return foundOtp
	}

	async findbyOtp(otp: number) {
		const foundOtp = await this.otpModel.findOne({ otp })

		return foundOtp
	}

	async generateOtp(): Promise<number> {
		const otp = getOtp(6)

		const foundOtp = await this.findbyOtp(otp)

		if (foundOtp) {
			return await this.generateOtp()
		}

		return otp
	}

	async removeByOtp(otp: number) {
		const deleteResult = await this.otpModel.deleteOne({ otp })

		return deleteResult
	}
}
