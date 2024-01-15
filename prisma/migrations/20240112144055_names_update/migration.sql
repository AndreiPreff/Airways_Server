/*
  Warnings:

  - You are about to drop the column `passangerLastName` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `passangerName` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `passangerPassportNumber` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "passangerLastName",
DROP COLUMN "passangerName",
DROP COLUMN "passangerPassportNumber",
ADD COLUMN     "passengerLastName" TEXT,
ADD COLUMN     "passengerName" TEXT,
ADD COLUMN     "passengerPassportNumber" TEXT;
