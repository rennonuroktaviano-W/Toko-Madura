-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `Transaksi_kasirId_fkey`;

-- AlterTable
ALTER TABLE `transaksi` ADD COLUMN `pelangganId` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('Selesai', 'MenungguPembayaran') NOT NULL DEFAULT 'Selesai',
    ADD COLUMN `sumber` ENUM('Kasir', 'Order') NOT NULL DEFAULT 'Kasir',
    MODIFY `kasirId` INTEGER NULL;

-- CreateTable
CREATE TABLE `FotoProduk` (
    `id` VARCHAR(191) NOT NULL,
    `mime` VARCHAR(191) NOT NULL,
    `ukuran` INTEGER NOT NULL,
    `data` LONGBLOB NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FotoProduk_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Transaksi_pelangganId_tanggal_idx` ON `Transaksi`(`pelangganId`, `tanggal`);

-- CreateIndex
CREATE INDEX `Transaksi_status_tanggal_idx` ON `Transaksi`(`status`, `tanggal`);

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_kasirId_fkey` FOREIGN KEY (`kasirId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
