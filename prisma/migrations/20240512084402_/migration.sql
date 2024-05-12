/*
  Warnings:

  - You are about to drop the column `status` on the `tickets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tickets` DROP COLUMN `status`,
    ADD COLUMN `ticket_status_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ticket_statuses` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_ticket_status_id_fkey` FOREIGN KEY (`ticket_status_id`) REFERENCES `ticket_statuses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
