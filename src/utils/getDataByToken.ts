import { IDataToken } from '@/jwt/types'
import * as jwt from 'jsonwebtoken'

export enum EVariantGetData {
	access = 'access',
	refresh = 'refresh',
}

export function getDataByToken(token: string, variant: `${EVariantGetData}`) {
	const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
	const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET

	let secret = ''

	if (variant === EVariantGetData.access) {
		secret = JWT_ACCESS_SECRET
	} else if (variant === EVariantGetData.refresh) {
		secret = JWT_REFRESH_SECRET
	}

	return jwt.verify(token, secret) as IDataToken
}
