-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('there', 'back');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "direction" "Direction" NOT NULL DEFAULT 'there';

-- CreateIndex
CREATE INDEX "Ticket_passengerPassportNumber_idx" ON "Ticket"("passengerPassportNumber");

-- CreateIndex
CREATE INDEX "Ticket_direction_idx" ON "Ticket"("direction");
