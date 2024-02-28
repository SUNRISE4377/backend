import { Types } from 'mongoose'

export enum EVariantValidateToken {
	access = 'access',
	refresh = 'refresh',
}

export interface IDataToken {
	userId: string | Types.ObjectId
}
