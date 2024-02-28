import { JwtModule } from '@/jwt/jwt.module'
import { UserModule } from '@/user/user.module'
import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
	imports: [UserModule, JwtModule],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule {}
