import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { Task } from './entities/task.entity'

@Injectable()
export class TaskService {
	constructor(
		@InjectModel(Task.name) private readonly taskModel: Model<Task>,
	) {}

	async create(createTaskDto: CreateTaskDto) {
		const createdTask = await this.taskModel.create({
			description: createTaskDto.description,
			title: createTaskDto.title,
		})

		return createdTask
	}

	async update(id: string, updateTaskDto: UpdateTaskDto) {
		const updateResult = await this.taskModel.updateOne(
			{ _id: id },
			updateTaskDto,
		)

		return updateResult
	}

	async remove(id: string) {
		const deleteResult = await this.taskModel.deleteOne({ _id: id })

		return deleteResult
	}

	async removeMany(ids: string[] | Types.ObjectId[]) {
		const deleteResult = await this.taskModel.deleteMany({
			_id: ids,
		})

		return deleteResult
	}

	async findById(id: string | Types.ObjectId) {
		const foundTask = await this.taskModel.findById(id)

		return foundTask
	}

	async duplicate(id: string | Types.ObjectId) {
		const foundTask = await this.findById(id)

		if (!foundTask) {
			return
		}

		const createdTask = await this.taskModel.create({
			description: foundTask.description,
			title: foundTask.title,
		})

		return createdTask
	}
}
