import { Types } from 'mongoose'
import { User } from '../entities/user.entity'

export type TUser = User & {
	_id: Types.ObjectId
} & Required<{
		_id: Types.ObjectId
	}>
