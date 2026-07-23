/*
  Warnings:

  - You are about to drop the column `otpHash` on the `PasswordResetToken` table. All the data in the column will be lost.
  - Added the required column `tokenHash` to the `PasswordResetToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PasswordResetToken" DROP COLUMN "otpHash",
ADD COLUMN     "tokenHash" TEXT NOT NULL;
