import { UserService } from '@/user/user.service'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { CreateBoardDto } from './dto/create-board.dto'
import { UpdateBoardDto } from './dto/update-board.dto'
import { Board } from './entities/board.entity'

@Injectable()
export class BoardService {
	constructor(
		@InjectModel(Board.name) private readonly boardModel: Model<Board>,
		private readonly userService: UserService,
	) {}

	async create(userId: string, createBoardDto: CreateBoardDto) {
		const createdBoard = await this.boardModel.create({
			name: createBoardDto.name,
			admins: [userId],
			users: [userId],
		})

		return createdBoard
	}

	async findAllByUserId(userId: string) {
		const foundBoards = await this.boardModel.find({
			users: userId,
		})

		return foundBoards
	}

	async findById(id: string | Types.ObjectId) {
		const foundBoard = await this.boardModel.findById(id)

		return foundBoard
	}

	async findDeepById(id: string) {
		const foundBoard = await this.findById(id)

		if (!foundBoard) {
			return
		}

		const deepFound = await foundBoard.populate({
			path: 'stages',
			populate: {
				path: 'tasks',
			},
		})

		return deepFound
	}

	async findByStageId(stageId: string) {
		const foundBoard = await this.boardModel.findOne({ stages: stageId })

		return foundBoard
	}

	async findByName(userId: string, name: string) {
		const foundBoards = await this.boardModel.find({
			users: userId,
			name: new RegExp(name, 'i'),
		})

		return foundBoards
	}

	async findAllBoardUsers(boardId: string) {
		const foundBoard = await this.findById(boardId)

		if (!foundBoard) {
			return
		}

		const foundUsers = await this.userService.findManyById(foundBoard.users)

		return foundUsers
	}

	async update(id: string, updateBoardDto: UpdateBoardDto) {
		const updateResult = await this.boardModel.updateOne(
			{ _id: id },
			updateBoardDto,
		)

		return updateResult
	}

	async leave(userId: string, boardId: string) {
		const foundBoard = await this.findById(boardId)

		if (!foundBoard) {
			return
		}

		const foundIdx = foundBoard.users.indexOf(userId)

		if (foundIdx === -1) {
			return
		}

		foundBoard.users.splice(foundIdx, 1)

		const savedBoard = await foundBoard.save()

		return savedBoard
	}

	async removeAdminFromBoard(
		boardId: string | Types.ObjectId,
		userId: string | Types.ObjectId,
	) {
		const foundBoard = await this.findById(boardId)

		if (!foundBoard) {
			return
		}

		const foundIdx = foundBoard.admins.indexOf(
			userId as unknown as Types.ObjectId,
		)

		foundBoard.admins.splice(foundIdx, 1)

		const savedBoard = await foundBoard.save()

		return savedBoard
	}

	async addAdminToBoard(
		boardId: string | Types.ObjectId,
		userId: string | Types.ObjectId,
	) {
		const foundBoard = await this.findById(boardId)

		if (!foundBoard) {
			return
		}

		foundBoard.admins[foundBoard.admins.length] = userId as Types.ObjectId

		const savedBoard = await foundBoard.save()

		return savedBoard
	}

	async remove(id: string) {
		const removeResult = await this.boardModel.deleteOne({ _id: id })

		return removeResult
	}

	async inviteUserToBoard(userId: string, boardId: string) {
		const foundBoard = await this.findById(boardId)

		if (!foundBoard) {
			return
		}

		if (foundBoard.users.includes(userId as unknown as string)) {
			return foundBoard
		}

		foundBoard.users[foundBoard.users.length] = userId

		const savedBoard = await foundBoard.save()

		if (!savedBoard) {
			return
		}

		return savedBoard
	}
}
