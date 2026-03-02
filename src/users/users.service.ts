import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { UpdateUserReferenceDto } from './dto/update.user.reference.dto';
// import { UpdateUserDto } from './dto/update.user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly hashingProvider: HashingProvider,
  ) {}

  async createUser(dto: CreateUserDto) {
    const user = this.userRepo.create(dto);
    return await this.userRepo.save(user);
  }

  async findOne(id: string) {
    return await this.userRepo.findOne({
      where: {
        id,
      },
    });
  }

  async findOneByEmail(email: string) {
    return await this.userRepo.findOne({
      where: {
        email,
      },
    });
  }

  async findAll() {
    return await this.userRepo.find();
  }

  async updateUserPrefernce(dto: UpdateUserReferenceDto, userId: string) {
    const user = await this.findOne(userId);
    if (!user) throw new NotFoundException('user not found');

    if (dto.emailNotifications !== undefined) {
      user.emailNotifications = dto.emailNotifications;
    }

    if (dto.inAppNotifications !== undefined) {
      user.inAppNotifications = dto.inAppNotifications;
    }

    const updated = await this.userRepo.save(user);
    return {
      message: 'Preferences updated successfully',
      preferences: {
        emailNotifications: updated.emailNotifications,
        inAppNotifications: updated.inAppNotifications,
      },
    };
  }

  // async update(id: string, UpdateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // async updateRefreshToken(userId: string, fcmToken: string | null) {
  //   const hash = fcmToken
  //     ? await this.hashingProvider.hashPassword(fcmToken)
  //     : null;

  //   return await this.userRepo.update(userId, { fcmToken: hash });
  // }
}
