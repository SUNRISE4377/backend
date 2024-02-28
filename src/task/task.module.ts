import { StageModule } from '@/stage/stage.module'
import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Task, TaskSchema } from './entities/task.entity'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
		forwardRef(() => StageModule),
	],
	controllers: [TaskController],
	providers: [TaskService],
	exports: [TaskService],
})
export class TaskModule {}
