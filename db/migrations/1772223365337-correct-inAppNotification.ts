import { MigrationInterface, QueryRunner } from "typeorm";

export class CorrectInAppNotification1772223365337 implements MigrationInterface {
    name = 'CorrectInAppNotification1772223365337'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "inApNotifications" TO "inAppNotifications"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "inAppNotifications" TO "inApNotifications"`);
    }

}
