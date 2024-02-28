import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Exclude, Transform } from 'class-transformer'
import { HydratedDocument, SchemaTypes, Types } from 'mongoose'

export type JwtDocument = HydratedDocument<Jwt>

@Schema({
	timestamps: true,
})
export class Jwt {
	@Transform(({ obj }) => obj._id.toString())
	_id: Types.ObjectId

	@Transform(({ obj }) => obj._id.toString())
	@Prop({
		type: SchemaTypes.ObjectId,
		ref: 'User',
		required: true,
		unique: true,
	})
	userId: Types.ObjectId

	@Prop({ required: true, unique: true, type: String })
	refreshToken: string

	@Exclude()
	updatedAt: Date

	@Exclude()
	createdAt: Date

	@Exclude()
	__v: number
}

export const JwtSchema = SchemaFactory.createForClass(Jwt)
