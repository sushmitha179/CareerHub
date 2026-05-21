-- AlterEnum
ALTER TYPE "ListingType" ADD VALUE 'JOB';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "description" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "deadline" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "resumeUrl" TEXT;
