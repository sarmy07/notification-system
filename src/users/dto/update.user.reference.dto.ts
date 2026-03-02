import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserReferenceDto {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppNotifications?: boolean;
}
