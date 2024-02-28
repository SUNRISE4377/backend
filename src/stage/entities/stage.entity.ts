import { Task, TaskDocument } from '@/task/entities/task.entity'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Exclude, Transform } from 'class-transformer'
import { HydratedDocument, SchemaTypes, Types } from 'mongoose'

export type StageDocument = HydratedDocument<Stage>

@Schema({
	timestamps: true,
})
export class Stage {
	@Transform(({ obj }) => obj._id.toString())
	_id: Types.ObjectId

	@Prop({ required: true, type: String })
	name: string

	@Transform(({ obj, key }) =>
		obj[key].map(item => {
			if (Types.ObjectId.isValid(item)) {
				return item.toString()
			}

			return new Task(item)
		}),
	)
	@Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Task' }], default: [] })
	tasks: TaskDocument[] | Types.ObjectId[]

	@Exclude()
	updatedAt: Date

	@Exclude()
	createdAt: Date

	@Exclude()
	__v: number

	constructor(defaultValues?: {
		_id: Types.ObjectId
		name: string
		tasks: TaskDocument[] | Types.ObjectId[]
		updatedAt: Date
		createdAt: Date
		__v: number
	}) {
		if (defaultValues) {
			this._id = defaultValues._id
			this.name = defaultValues.name
			this.tasks = defaultValues.tasks
			this.updatedAt = defaultValues.updatedAt
			this.createdAt = defaultValues.createdAt
			this.__v = defaultValues.__v
		}
	}
}

export const StageSchema = SchemaFactory.createForClass(Stage)
