import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Exclude, Transform } from 'class-transformer'
import { HydratedDocument, Types } from 'mongoose'

export type TaskDocument = HydratedDocument<Task>

@Schema({
	timestamps: true,
})
export class Task {
	@Transform(({ obj }) => obj._id.toString())
	_id: Types.ObjectId

	@Prop({ required: true, type: String })
	title: string

	@Prop({ required: true, type: String })
	description: string

	@Exclude()
	updatedAt: Date

	@Exclude()
	createdAt: Date

	@Exclude()
	__v: number

	constructor(defaultValues?: {
		_id: Types.ObjectId
		title: string
		description: string
		updatedAt: Date
		createdAt: Date
		__v: number
	}) {
		if (defaultValues) {
			this._id = defaultValues._id
			this.title = defaultValues.title
			this.description = defaultValues.description
			this.updatedAt = defaultValues.updatedAt
			this.createdAt = defaultValues.createdAt
			this.__v = defaultValues.__v
		}
	}
}

export const TaskSchema = SchemaFactory.createForClass(Task)
