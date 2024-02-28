import { BoardModule } from '@/board/board.module'
import { TaskModule } from '@/task/task.module'
import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Stage, StageSchema } from './entities/stage.entity'
import { StageController } from './stage.controller'
import { StageService } from './stage.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Stage.name, schema: StageSchema }]),
		forwardRef(() => BoardModule),
		forwardRef(() => TaskModule),
	],
	controllers: [StageController],
	providers: [StageService],
	exports: [StageService],
})
export class StageModule {}
