/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "certificateDate" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "qualification" TEXT,
    "organization" TEXT,
    "pdfPath" TEXT,
    "batchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNumber_key" ON "Certificate"("certificateNumber");

-- CreateIndex
CREATE INDEX "Certificate_candidateName_idx" ON "Certificate"("candidateName");

-- CreateIndex
CREATE INDEX "Certificate_courseName_idx" ON "Certificate"("courseName");

-- CreateIndex
CREATE INDEX "Certificate_batchId_idx" ON "Certificate"("batchId");

-- CreateIndex
CREATE INDEX "Certificate_certificateDate_idx" ON "Certificate"("certificateDate");
