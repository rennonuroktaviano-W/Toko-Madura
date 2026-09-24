-- CreateTable
CREATE TABLE `Pengaturan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaToko` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `tagline` VARCHAR(191) NOT NULL DEFAULT 'Warung Kelontong 24 Jam',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kategori` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `warna` VARCHAR(191) NOT NULL DEFAULT '#f59e0b',
    `icon` VARCHAR(191) NOT NULL DEFAULT '🏪',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Kategori_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produk` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `kategoriId` INTEGER NOT NULL,
    `harga` INTEGER NOT NULL,
    `stok` INTEGER NOT NULL DEFAULT 0,
    `satuan` VARCHAR(191) NOT NULL DEFAULT 'pcs',
    `fotoUrl` VARCHAR(191) NULL,
    `status` ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Produk_nama_idx`(`nama`),
    INDEX `Produk_kategoriId_idx`(`kategoriId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaksi` (
    `id` VARCHAR(191) NOT NULL,
    `noTransaksi` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `kasirId` INTEGER NOT NULL,
    `subtotal` INTEGER NOT NULL,
    `grandTotal` INTEGER NOT NULL,
    `metodeBayar` ENUM('Tunai', 'QRIS') NOT NULL,
    `jumlahBayar` INTEGER NOT NULL,
    `kembalian` INTEGER NOT NULL,
    `jumlahItem` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Transaksi_noTransaksi_key`(`noTransaksi`),
    INDEX `Transaksi_tanggal_idx`(`tanggal`),
    INDEX `Transaksi_kasirId_idx`(`kasirId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemTransaksi` (
    `id` VARCHAR(191) NOT NULL,
    `transaksiId` VARCHAR(191) NOT NULL,
    `produkId` INTEGER NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `hargaSatuan` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,
    `subtotal` INTEGER NOT NULL,
    `catatan` VARCHAR(191) NULL,

    INDEX `ItemTransaksi_transaksiId_idx`(`transaksiId`),
    INDEX `ItemTransaksi_produkId_idx`(`produkId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Produk` ADD CONSTRAINT `Produk_kategoriId_fkey` FOREIGN KEY (`kategoriId`) REFERENCES `Kategori`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_kasirId_fkey` FOREIGN KEY (`kasirId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemTransaksi` ADD CONSTRAINT `ItemTransaksi_transaksiId_fkey` FOREIGN KEY (`transaksiId`) REFERENCES `Transaksi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemTransaksi` ADD CONSTRAINT `ItemTransaksi_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
