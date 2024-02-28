import { BoardService } from '@/board/board.service'
import { TaskDocument } from '@/task/entities/task.entity'
import { TaskService } from '@/task/task.service'
import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { CreateStageDto } from './dto/create-stage.dto'
import { UpdateStageDto } from './dto/update-stage.dto'
import { Stage } from './entities/stage.entity'

@Injectable()
export class StageService {
	constructor(
		@InjectModel(Stage.name) private readonly stageModel: Model<Stage>,
		@Inject(forwardRef(() => BoardService))
		private readonly boardService: BoardService,
		@Inject(forwardRef(() => TaskService))
		private readonly taskService: TaskService,
	) {}

	async create(createStageDto: CreateStageDto) {
		const createdStage = await this.stageModel.create({
			name: createStageDto.name,
			tasks: createStageDto.tasks,
		})

		return createdStage
	}

	async update(id: string, updateStageDto: UpdateStageDto) {
		const updatedStage = await this.stageModel.updateOne(
			{ _id: id },
			updateStageDto,
		)

		return updatedStage
	}

	async findById(id) {
		const foundStage = await this.stageModel.findById(id)

		return foundStage
	}

	async findByTaskId(taskId) {
		const foundStage = await this.stageModel.findOne({ tasks: taskId })

		return foundStage
	}

	async remove(id: string) {
		const deleteResult = await this.stageModel.deleteOne({ _id: id })

		return deleteResult
	}

	async removeMany(ids: string[] | Types.ObjectId[]) {
		const stages = await this.stageModel.find({ _id: ids })

		for (const stage of stages) {
			if (stage.tasks.length === 0) {
				continue
			}

			const deleteResult = await this.taskService.removeMany(
				stage.tasks as Types.ObjectId[],
			)

			if (!deleteResult.deletedCount) {
				return
			}
		}

		const deleteResult = await this.stageModel.deleteMany({ _id: ids })

		return deleteResult
	}

	async getDeepInfo(id: string | Types.ObjectId) {
		const foundStage = await this.findById(id)

		if (!foundStage) {
			return
		}

		const populatedStage = await foundStage.populate('tasks')

		return populatedStage
	}

	async addTasks(
		stageId: string | Types.ObjectId,
		taskIds: string[] | Types.ObjectId[],
	) {
		const foundStage = await this.findById(stageId)

		if (!foundStage) {
			throw new BadRequestException('Stage not found')
		}

		for (const id of taskIds) {
			;(foundStage.tasks as unknown as string[])[foundStage.tasks.length] =
				id as string
		}

		await foundStage.save()

		return
	}

	async duplicate(id: string) {
		const [foundStage, foundBoard] = await Promise.all([
			this.findById(id),
			this.boardService.findByStageId(id),
		])

		if (!foundStage || !foundBoard) {
			return
		}

		const createdStage = await this.create({
			boardId: foundBoard._id as unknown as string,
			name: foundStage.name,
		})

		const promiseTasks: Promise<TaskDocument>[] = []

		for (const task of foundStage.tasks) {
			promiseTasks[promiseTasks.length] = this.taskService.duplicate(task._id)
		}

		const createdTasks = await Promise.all(promiseTasks)

		const taskIds: Types.ObjectId[] = []

		for (const task of createdTasks) {
			if (!task) {
				continue
			}

			taskIds[taskIds.length] = task._id
		}

		await this.addTasks(createdStage._id, taskIds)

		const foundStageInfo = await this.getDeepInfo(createdStage._id)

		return foundStageInfo
	}
}
