import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Exclude, Transform } from 'class-transformer'
import { HydratedDocument, SchemaTypes, Types } from 'mongoose'

export type FileDocument = HydratedDocument<File>

@Schema({
	timestamps: true,
})
export class File {
	@Transform(({ obj }) => obj._id.toString())
	_id: Types.ObjectId

	@Transform(({ obj }) => obj._id.toString())
	@Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'User' })
	userId: Types.ObjectId

	@Prop({ required: true, unique: true, type: String })
	fileName: string

	@Prop({ required: true, type: String })
	originalName: string

	@Prop({ required: true, type: Number })
	size: number

	@Prop({ required: true, type: String })
	mimetype: string

	@Exclude()
	updatedAt: Date

	@Exclude()
	createdAt: Date

	@Exclude()
	__v: number
}

export type TFile = File & {
	_id: Types.ObjectId
} & Required<{
		_id: Types.ObjectId
	}>

export const FileSchema = SchemaFactory.createForClass(File)
