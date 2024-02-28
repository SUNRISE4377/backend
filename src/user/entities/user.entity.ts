import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Exclude, Transform } from 'class-transformer'
import { HydratedDocument, Types } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({
	timestamps: true,
})
export class User {
	@Transform(({ obj }) => obj._id.toString())
	_id: Types.ObjectId

	@Prop({ required: true, unique: true, type: String })
	email: string

	@Prop({ required: true, unique: true, type: String })
	userName: string

	@Exclude()
	@Prop({ required: true, type: String })
	password: string

	@Prop({ type: String })
	firstName?: string

	@Prop({ type: String })
	lastName?: string

	@Prop({ type: String })
	bio?: string

	@Prop({ type: String })
	birthday?: string

	@Transform(({ obj, key }) =>
		obj[key].map(item => {
			const { _id, ...other } = item
			return other
		}),
	)
	@Prop({ type: [{ value: String }] })
	urls?: { value: string }[]

	@Exclude()
	@Prop({ default: false, type: Boolean })
	isActivated: boolean

	@Exclude()
	@Prop({ required: true, unique: true, type: String })
	activationKey: string

	@Exclude()
	updatedAt: Date

	@Exclude()
	createdAt: Date

	@Exclude()
	__v: number

	constructor(defaultValues?: {
		_id: Types.ObjectId
		email: string
		userName: string
		password: string
		firstName?: string
		lastName?: string
		bio?: string
		birthday?: string
		urls?: { value: string }[]
		isActivated: boolean
		activationKey: string
		updatedAt: Date
		createdAt: Date
		__v: number
	}) {
		if (defaultValues) {
			this._id = defaultValues._id
			this.email = defaultValues.email
			this.userName = defaultValues.userName
			this.password = defaultValues.password
			this.firstName = defaultValues.firstName
			this.lastName = defaultValues.lastName
			this.bio = defaultValues.bio
			this.birthday = defaultValues.birthday
			this.urls = defaultValues.urls
			this.isActivated = defaultValues.isActivated
			this.activationKey = defaultValues.activationKey
			this.updatedAt = defaultValues.updatedAt
			this.createdAt = defaultValues.createdAt
			this.__v = defaultValues.__v
		}
	}
}

export const UserSchema = SchemaFactory.createForClass(User)
