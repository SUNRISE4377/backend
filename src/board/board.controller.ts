import { GetUserIdByToken } from '@/decorators/GetUserIdByToken'
import { JwtAuthGuard } from '@/guard/jwt-auth.guard'
import SerializerInterceptor from '@/interceptors/Serializer.interceptor'
import { StageService } from '@/stage/stage.service'
import { User } from '@/user/entities/user.entity'
import { UserService } from '@/user/user.service'
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	ForbiddenException,
	forwardRef,
	Get,
	Inject,
	InternalServerErrorException,
	Param,
	Patch,
	Post,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { Types } from 'mongoose'
import { BoardService } from './board.service'
import { CreateBoardDto } from './dto/create-board.dto'
import { UpdateBoardDto } from './dto/update-board.dto'
import { Board } from './entities/board.entity'

@Controller('board')
export class BoardController {
	constructor(
		private readonly boardService: BoardService,
		@Inject(forwardRef(() => StageService))
		private readonly stageService: StageService,
		private readonly userService: UserService,
	) {}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(SerializerInterceptor(Board))
	@Post()
	async create(
		@GetUserIdByToken() userId: string,
		@Body() createBoardDto: CreateBoardDto,
	) {
		try {
			const createdBoard = await this.boardService.create(
				userId,
				createBoardDto,
			)

			if (!createdBoard) {
				throw new BadRequestException('Failed to create Board.')
			}

			return createdBoard
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(SerializerInterceptor(Board))
	@Post('name')
	async findByName(
		@GetUserIdByToken() userId: string,
		@Body() findByNameDto: { name: string },
	) {
		try {
			const foundBoards = await this.boardService.findByName(
				userId,
				findByNameDto.name,
			)

			if (!Array.isArray(foundBoards)) {
				throw new BadRequestException('Board not found')
			}

			return foundBoards
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(SerializerInterceptor(Board))
	@Post('leave')
	async leave(
		@GetUserIdByToken() userId: string,
		@Body() leaveDto: { boardId: string },
	) {
		try {
			const foundBoard = await this.boardService.findById(leaveDto.boardId)

			if (!foundBoard) {
				throw new BadRequestException('Board not found')
			}

			const savedBoard = await this.boardService.leave(userId, leaveDto.boardId)

			if (!savedBoard) {
				throw new BadRequestException('Failed to leave the board.')
			}

			return savedBoard
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(SerializerInterceptor(Board))
	@Get('deep/:id')
	async findDeepById(@Param('id') id: string) {
		try {
			const foundBoard = await this.boardService.findDeepById(id)

			return foundBoard
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(SerializerInterceptor(Board))
	@Get('invite/:boardId')
	async inviteUserToBoard(
		@GetUserIdByToken() userId: string,
		@Param('boardId') boardId: string,
	) {
		try {
			const foundBoard = await this.boardService.findById(boardId)

			if (!foundBoard) {
				throw new BadRequestException('Board not found')
			}

			const savedBoard = await this.boardService.inviteUserToBoard(
				userId,
				boardId,
			)

			if (!savedBoard) {
				throw new BadRequestException('Failed to join the board.')
			}

			return savedBoard
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(SerializerInterceptor(Board))
	@Post('admin/remove/:boardId')
	async removeAdminFromBoard(
		@GetUserIdByToken() userId: string,
		@Param('boardId') boardId: string,
		@Body() removeAdminFromBoardDto: { removeId: string },
	) {
		try {
			const foundBoard = await this.boardService.findById(boardId)

			if (!foundBoard) {
				throw new BadRequestException('Board not found')
			}

			const foundUser = await this.userService.findById(userId)

			if (!foundUser) {
				throw new BadRequestException('User not found')
			}

			if (!foundBoard.admins.includes(foundUser._id)) {
				throw new ForbiddenException('Access closed')
			}

			const savedBoard = await this.boardService.removeAdminFromBoard(
				boardId,
				removeAdminFromBoardDto.removeId,
			)

			if (!savedBoard) {
				throw new BadRequestException('Failed to remove admin.')
			}

			return savedBoard
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(SerializerInterceptor(Board))
	@Post('admin/add/:boardId')
	async addAdminToBoard(
		@GetUserIdByToken() userId: string,
		@Param('boardId') boardId: string,
		@Body() removeAdminFromBoardDto: { addId: string },
	) {
		try {
			const foundBoard = await this.boardService.findById(boardId)

			if (!foundBoard) {
				throw new BadRequestException('Board not found')
			}

			const foundUser = await this.userService.findById(userId)

			if (!foundUser) {
				throw new BadRequestException('User not found')
			}

			if (!foundBoard.admins.includes(foundUser._id)) {
				throw new ForbiddenException('Access closed')
			}

			const savedBoard = await this.boardService.addAdminToBoard(
				boardId,
				removeAdminFromBoardDto.addId,
			)

			if (!savedBoard) {
				throw new BadRequestException('Failed to add admin.')
			}

			return savedBoard
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(SerializerInterceptor(User))
	@Get('users/:boardId')
	async findAllBoardUsers(@Param('boardId') boardId: string) {
		try {
			const foundBoard = await this.boardService.findById(boardId)

			if (!foundBoard) {
				throw new BadRequestException('Board not found')
			}

			const foundUsers = await this.boardService.findAllBoardUsers(boardId)

			return foundUsers
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(SerializerInterceptor(Board))
	@Get('all')
	async findAllByUserId(@GetUserIdByToken() userId: string) {
		try {
			const foundBoards = await this.boardService.findAllByUserId(userId)

			if (!Array.isArray(foundBoards)) {
				throw new BadRequestException('Boards not found')
			}

			return foundBoards
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(SerializerInterceptor(Board))
	@Patch(':id')
	async update(
		@Param('id') id: string,
		@Body() updateBoardDto: UpdateBoardDto,
	) {
		try {
			const updateResult = await this.boardService.update(id, updateBoardDto)

			if (!updateResult.modifiedCount) {
				throw new Error('Failed to update board')
			}

			const foundBoard = await this.boardService.findById(id)

			if (!foundBoard) {
				throw new Error('Board not found')
			}

			return foundBoard
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async remove(@Param('id') id: string) {
		try {
			const foundBoard = await this.boardService.findById(id)

			if (!foundBoard) {
				throw new BadRequestException('Board not found')
			}

			if (foundBoard.stages.length !== 0) {
				const stagesDeletedResult = await this.stageService.removeMany(
					foundBoard.stages as Types.ObjectId[],
				)

				if (!stagesDeletedResult.deletedCount) {
					throw new BadRequestException('Failed to delete stages')
				}
			}

			const deleteResult = await this.boardService.remove(id)

			return {
				success: !!deleteResult,
			}
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}
}
