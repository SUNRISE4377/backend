import { getHash } from '@/utils/getHash'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UserService {
	constructor(@InjectModel(User.name) private userModel: Model<User>) {}

	async create(createUserDto: CreateUserDto) {
		const createdUser = await this.userModel.create(createUserDto)

		return createdUser
	}

	async update(userId: string, updateUserDto: UpdateUserDto) {
		const { password, ...other } = updateUserDto

		if (password) {
			const passwordHash = await getHash(password)

			const updateResult = await this.userModel.updateOne(
				{ _id: userId },
				{ password: passwordHash, ...other },
			)

			return updateResult
		}

		const updateResult = await this.userModel.updateOne(
			{ _id: userId },
			updateUserDto,
		)

		return updateResult
	}

	async findByActivationKey(activationKey: string) {
		const foundUser = await this.userModel.findOne({ activationKey })

		return foundUser
	}

	async findByEmail(email: string) {
		const foundUser = await this.userModel.findOne({ email })

		return foundUser
	}

	async findById(id: string | Types.ObjectId) {
		const foundUser = await this.userModel.findById({ _id: id })

		return foundUser
	}

	async findManyById(ids: string[] | Types.ObjectId[]) {
		const foundUsers = await this.userModel.find({ _id: ids })

		return foundUsers
	}

	async findByUserName(userName: string) {
		const foundUser = await this.userModel.findOne({ userName })

		return foundUser
	}

	async remove(id: string) {
		const deleteResult = await this.userModel.deleteOne({ _id: id })

		return deleteResult
	}
}
