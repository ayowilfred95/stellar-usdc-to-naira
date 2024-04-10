-- CreateTable
CREATE TABLE "SourceAccount" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "stellarAccount" TEXT NOT NULL,
    "stellarSecret" TEXT NOT NULL,
    "keystore" TEXT NOT NULL,
    "balance" TEXT DEFAULT '0',

    CONSTRAINT "SourceAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "userStellarAccount" TEXT NOT NULL,
    "userStellarSecret" TEXT NOT NULL,
    "balance" TEXT DEFAULT '0',
    "asset_type" TEXT,
    "username" TEXT NOT NULL,
    "sourceAccountId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Distributor" (
    "id" TEXT NOT NULL,
    "distributorStellarAccount" TEXT NOT NULL,
    "distributorStellarSecret" TEXT NOT NULL,
    "balance" TEXT DEFAULT '0',
    "asset_type" TEXT,
    "username" TEXT NOT NULL,
    "sourceAccountId" TEXT,

    CONSTRAINT "Distributor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SourceAccount_username_key" ON "SourceAccount"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Distributor_username_key" ON "Distributor"("username");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_sourceAccountId_fkey" FOREIGN KEY ("sourceAccountId") REFERENCES "SourceAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distributor" ADD CONSTRAINT "Distributor_sourceAccountId_fkey" FOREIGN KEY ("sourceAccountId") REFERENCES "SourceAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
