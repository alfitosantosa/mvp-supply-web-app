/*
  Warnings:

  - You are about to drop the column `isActice` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "isActice",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;
