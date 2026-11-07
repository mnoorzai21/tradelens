-- CreateEnum
CREATE TYPE "Side" AS ENUM ('LONG', 'SHORT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Setup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" "Side" NOT NULL,
    "entryPrice" DECIMAL(12,4) NOT NULL,
    "exitPrice" DECIMAL(12,4) NOT NULL,
    "stopPrice" DECIMAL(12,4),
    "shares" INTEGER NOT NULL,
    "fees" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "entryAt" TIMESTAMP(3) NOT NULL,
    "exitAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "setupId" TEXT,
    "importId" TEXT,
    "dedupeHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Import" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "broker" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Import_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TagToTrade" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TagToTrade_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Setup_userId_name_key" ON "Setup"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");

-- CreateIndex
CREATE INDEX "Trade_userId_exitAt_idx" ON "Trade"("userId", "exitAt");

-- CreateIndex
CREATE INDEX "Trade_userId_symbol_idx" ON "Trade"("userId", "symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_userId_dedupeHash_key" ON "Trade"("userId", "dedupeHash");

-- CreateIndex
CREATE INDEX "_TagToTrade_B_index" ON "_TagToTrade"("B");

-- AddForeignKey
ALTER TABLE "Setup" ADD CONSTRAINT "Setup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_setupId_fkey" FOREIGN KEY ("setupId") REFERENCES "Setup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_importId_fkey" FOREIGN KEY ("importId") REFERENCES "Import"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Import" ADD CONSTRAINT "Import_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTrade" ADD CONSTRAINT "_TagToTrade_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTrade" ADD CONSTRAINT "_TagToTrade_B_fkey" FOREIGN KEY ("B") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
