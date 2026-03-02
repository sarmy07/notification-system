import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import authConfig from './config/auth.config';
import { HashingProvider } from './providers/hashing.provider';

const mockUserService = {
  findOneByEmail: jest.fn(),
  createUser: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockAuthConfig = {
  secret: 'secret-123',
  expiresIn: '1h',
};

const mockHashingProvider = {
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: authConfig.KEY,
          useValue: mockAuthConfig,
        },
        {
          provide: HashingProvider,
          useValue: mockHashingProvider,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return NotFoundException if user is not found', async () => {
      const dto = {
        email: 'wrong@email.com',
        password: 'pass-123',
      };
      mockUserService.findOneByEmail.mockResolvedValue(null);

      await expect(service.loginUser(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if password is wrong', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@gmail.com',
        password: 'hashedPassword',
      };

      mockUserService.findOneByEmail.mockResolvedValue(mockUser);
      mockHashingProvider.comparePassword.mockResolvedValue(false);

      await expect(
        service.loginUser({
          email: 'test@gmail.com',
          password: 'hashedPassword',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should login user and return token', async () => {
      const dto = {
        email: 'test@gmail.com',
        password: 'pass-123',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@gmail.com',
        name: 'john',
        password: await bcrypt.hash('correct-pass', 10),
      };

      mockUserService.findOneByEmail.mockResolvedValue(mockUser);
      mockHashingProvider.comparePassword.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await service.loginUser({
        email: 'test@gmail.com',
        password: 'secret-123',
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@gmail.com');
    });
  });

  describe('registerUser', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockUserService.findOneByEmail.mockResolvedValue({ id: 'user-123' });

      await expect(
        service.registerUser({
          name: 'John',
          email: 'existing@gmail.com',
          password: 'secret123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should register user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'John',
        email: 'new@gmail.com',
        password: 'hashedpassword',
      };

      mockUserService.findOneByEmail.mockResolvedValue(null); // no existing user
      mockHashingProvider.hashPassword.mockResolvedValue('hashedpassword');
      mockUserService.createUser.mockResolvedValue(mockUser);

      const result = await service.registerUser({
        name: 'John',
        email: 'new@gmail.com',
        password: 'secret123',
      });

      expect(result.message).toBe('Signup success');
      expect(result.user.email).toBe('new@gmail.com');
    });
  });
});
