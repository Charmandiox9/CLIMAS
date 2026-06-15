-- AlterTable
ALTER TABLE "MedicalRecord" ADD COLUMN     "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fcmToken" TEXT;
