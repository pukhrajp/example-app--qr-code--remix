-- CreateEnum
CREATE TYPE "CursorCategory" AS ENUM ('PROFESSIONAL', 'FUN', 'SEASONAL', 'GAMING', 'FASHION', 'MINIMAL', 'ANIMATED');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCode" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productHandle" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "scans" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cursor" (
    "id" SERIAL NOT NULL,
    "shop" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "CursorCategory" NOT NULL,
    "type" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "hoverImageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "hotspotX" INTEGER NOT NULL DEFAULT 0,
    "hotspotY" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cursor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CursorSettings" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "activeCursorId" INTEGER,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "settings" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CursorSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cursor_shop_idx" ON "Cursor"("shop");

-- CreateIndex
CREATE INDEX "Cursor_category_idx" ON "Cursor"("category");

-- CreateIndex
CREATE INDEX "Cursor_type_idx" ON "Cursor"("type");

-- CreateIndex
CREATE INDEX "Cursor_isPublished_idx" ON "Cursor"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "CursorSettings_shop_key" ON "CursorSettings"("shop");

-- CreateIndex
CREATE INDEX "CursorSettings_shop_idx" ON "CursorSettings"("shop");

-- CreateIndex
CREATE INDEX "CursorSettings_activeCursorId_idx" ON "CursorSettings"("activeCursorId");

-- AddForeignKey
ALTER TABLE "CursorSettings" ADD CONSTRAINT "CursorSettings_activeCursorId_fkey" FOREIGN KEY ("activeCursorId") REFERENCES "Cursor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
