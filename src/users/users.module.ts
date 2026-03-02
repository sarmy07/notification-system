import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { BcryptProvider } from 'src/auth/providers/bcrypt.provider';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UsersService,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
