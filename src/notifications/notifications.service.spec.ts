import {
  Notification,
  NotificationStatus,
  NotificationType,
} from './entities/notification.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { UsersService } from 'src/users/users.service';
import { NotFoundException } from '@nestjs/common';

const mockNotificationRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

const mockEmailQueue = {
  add: jest.fn(),
};

const mockInAppQueue = {
  add: jest.fn(),
};

const mockUserService = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: getQueueToken('email-notifications'),
          useValue: mockEmailQueue,
        },
        {
          provide: getQueueToken('inApp-notifications'),
          useValue: mockInAppQueue,
        },
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  // clear all mock call history after each test
  // so tests don't affect each other
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(
        service.create(
          {
            title: 'Test',
            message: 'Test message',
            type: NotificationType.EMAIL,
          },
          'non-existent-user-id',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create an email notification and add job to email queue', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@gmail.com',
        emailNotifications: true,
        inAppNotifications: true,
      };

      const mockNotification = {
        id: 'notif-123',
        title: 'welcome',
        message: 'hello there',
        type: NotificationType.EMAIL,
        userId: 'user-123',
        status: NotificationStatus.PENDING,
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);
      mockEmailQueue.add.mockResolvedValue({});

      //   act
      const result = await service.create(
        {
          title: 'welcome',
          message: 'hello there',
          type: NotificationType.EMAIL,
        },
        'user-123',
      );
      // assert
      expect(result).toEqual(mockNotification);
      //   verify the email queue was called with correct data
      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          notificationId: 'notif-123',
          to: 'test@gmail.com',
        }),

        expect.any(Object),
      );

      expect(mockInAppQueue.add).not.toHaveBeenCalled();
    });

    it('should create an in-app notification and add job to inApp quque', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@gmail.com',
        emailNotifications: true,
        inAppNotifications: true,
      };

      const mockNotification = {
        id: 'notif-123',
        title: 'hello',
        message: 'real-time message',
        type: NotificationType.IN_APP,
        userId: 'user-123',
        status: NotificationStatus.PENDING,
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);
      mockInAppQueue.add.mockResolvedValue({});

      const result = await service.create(
        {
          title: 'hello',
          message: 'real-time message',
          type: NotificationType.IN_APP,
        },
        'user-123',
      );

      expect(result).toEqual(mockNotification);
      expect(mockInAppQueue.add).toHaveBeenCalledWith(
        'send-inApp',
        expect.objectContaining({
          notificationId: 'notif-123',
          userId: 'user-123',
        }),

        expect.anything(),
      );

      expect(mockEmailQueue.add).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should throw false if notification is not found', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(null);

      const result = await service.updateStatus(
        'bad-id',
        NotificationStatus.SENT,
      );

      expect(result).toBe(false);
    });

    it('it should update notification status', async () => {
      const mockNotification = {
        id: 'notif-123',
        status: NotificationStatus.PENDING,
      };

      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue({});

      await service.updateStatus('notif-123', NotificationStatus.SENT);

      expect(mockNotificationRepository.update).toHaveBeenCalledWith(
        mockNotification,
        { status: NotificationStatus.SENT },
      );
    });
  });

  describe('find all', () => {
    it('should return notification for user', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          userId: 'user-123',
          title: 'first',
        },
        {
          id: 'notif-2',
          userId: 'user-123',
          title: 'second',
        },
      ];

      mockNotificationRepository.find.mockReturnValue(mockNotifications);

      const result = await service.findAllForUsers('user-123');

      expect(result).toEqual(mockNotifications);
      expect(mockNotificationRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { createdAt: 'DESC' },
      });
    });
  });
});
