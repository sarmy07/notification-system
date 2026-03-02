import { Notification } from 'src/notifications/entities/notification.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: true })
  inAppNotifications: boolean;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
