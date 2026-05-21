/*
  Warnings:

  - You are about to drop the column `companyName` on the `Company` table. All the data in the column will be lost.
  - The `skills` column on the `Student` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[studentId,listingId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'COMPANY');

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "companyName",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "skills" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "skills",
ADD COLUMN     "skills" TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STUDENT';

-- CreateIndex
CREATE UNIQUE INDEX "Application_studentId_listingId_key" ON "Application"("studentId", "listingId");
