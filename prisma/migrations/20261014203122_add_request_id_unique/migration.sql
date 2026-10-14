ALTER TABLE `Transaksi`
ADD COLUMN `requestId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Transaksi_requestId_key`
ON `Transaksi`(`requestId`);