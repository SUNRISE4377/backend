import { BoardService } from '@/board/board.service'
import { JwtAuthGuard } from '@/guard/jwt-auth.guard'
import SerializerInterceptor from '@/interceptors/Serializer.interceptor'
import { TaskService } from '@/task/task.service'
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	forwardRef,
	Inject,
	InternalServerErrorException,
	Param,
	Patch,
	Post,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { Types } from 'mongoose'
import { CreateStageDto } from './dto/create-stage.dto'
import { UpdateStageDto } from './dto/update-stage.dto'
import { Stage } from './entities/stage.entity'
import { StageService } from './stage.service'

@Controller('stage')
export class StageController {
	constructor(
		private readonly stageService: StageService,
		@Inject(forwardRef(() => BoardService))
		private readonly boardService: BoardService,
		@Inject(forwardRef(() => TaskService))
		private readonly taskService: TaskService,
	) {}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(SerializerInterceptor(Stage))
	@Post()
	async create(@Body() createStageDto: CreateStageDto) {
		try {
			const foundBoard = await this.boardService.findById(
				createStageDto.boardId,
			)

			if (!foundBoard) {
				throw new BadRequestException('Board not found')
			}

			const createdStage = await this.stageService.create(createStageDto)

			foundBoard.stages[foundBoard.stages.length] = createdStage._id

			await foundBoard.save()

			return createdStage
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(SerializerInterceptor(Stage))
	@Patch(':id')
	async update(
		@Param('id') id: string,
		@Body() updateStageDto: UpdateStageDto,
	) {
		try {
			const updateResult = await this.stageService.update(id, updateStageDto)

			if (!updateResult.modifiedCount) {
				throw new BadRequestException('Failed to update the Stage.')
			}

			const foundStage = await this.stageService.getDeepInfo(id)

			if (!foundStage) {
				throw new BadRequestException('Stage not found')
			}

			return foundStage
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(SerializerInterceptor(Stage))
	@Post('/duplicate')
	async duplicate(@Body() duplicateStageDto: { id: string; boardId: string }) {
		try {
			const foundBoard = await this.boardService.findById(
				duplicateStageDto.boardId,
			)

			if (!foundBoard) {
				throw new BadRequestException('Board not found')
			}

			const foundStage = await this.stageService.findById(duplicateStageDto.id)

			if (!foundStage) {
				throw new BadRequestException('Stage not found')
			}

			const duplicatedStage = await this.stageService.duplicate(
				duplicateStageDto.id,
			)

			if (!duplicatedStage) {
				throw new BadRequestException('Failed to duplicate stage.')
			}

			const foundIdx = foundBoard.stages.findIndex(
				pred => pred.toString() === foundStage._id.toString(),
			)

			foundBoard.stages.splice(foundIdx + 1, 0, duplicatedStage._id)

			await foundBoard.save()

			return duplicatedStage
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async remove(@Param('id') id: string) {
		try {
			const foundBoard = await this.boardService.findByStageId(id)

			if (!foundBoard) {
				throw new BadRequestException('Board not found')
			}

			const foundStage = await this.stageService.findById(id)

			if (!foundStage) {
				throw new BadRequestException('Stage not found')
			}

			if (foundStage.tasks.length !== 0) {
				const tasksDeletedResult = await this.taskService.removeMany(
					foundStage.tasks as Types.ObjectId[],
				)

				if (!tasksDeletedResult.deletedCount) {
					throw new BadRequestException('Failed to delete tasks')
				}
			}

			const deleteResult = await this.stageService.remove(id)

			const foudnIdx = foundBoard.stages.findIndex(
				pred => pred.toString() === id.toString(),
			)

			foundBoard.stages.splice(foudnIdx, 1)

			await foundBoard.save()

			return {
				success: !!deleteResult.deletedCount,
			}
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message })
		}
	}
}
