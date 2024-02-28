import { Stage, StageDocument } from '@/stage/entities/stage.entity'
import { User } from '@/user/entities/user.entity'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Exclude, Transform } from 'class-transformer'
import { HydratedDocument, SchemaTypes, Types } from 'mongoose'

export type BoardDocument = HydratedDocument<Board>

@Schema({
	timestamps: true,
})
export class Board {
	@Transform(({ obj }) => obj._id.toString())
	_id: Types.ObjectId

	@Prop({ required: true, type: String })
	name: string

	@Prop({ type: Boolean, default: false })
	isFavorite: boolean

	@Transform(({ obj, key }) =>
		obj[key].map(item => {
			if (Types.ObjectId.isValid(item)) {
				return item.toString()
			}

			return new Stage(item)
		}),
	)
	@Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Stage' }], default: [] })
	stages: StageDocument[] | Types.ObjectId[]

	@Transform(({ obj, key }) =>
		obj[key].map(item => {
			if (Types.ObjectId.isValid(item)) {
				return item.toString()
			}

			return new User(item)
		}),
	)
	@Prop({ required: true, type: [{ type: SchemaTypes.ObjectId, ref: 'User' }] })
	admins: Types.ObjectId[]

	@Transform(({ obj, key }) =>
		obj[key].map(item => {
			if (Types.ObjectId.isValid(item)) {
				return item.toString()
			}

			return new User(item)
		}),
	)
	@Prop({ required: true, type: [{ type: SchemaTypes.ObjectId, ref: 'User' }] })
	users: string[]

	@Exclude()
	updatedAt: Date

	createdAt: Date

	@Exclude()
	__v: number
}

export const BoardSchema = SchemaFactory.createForClass(Board)
