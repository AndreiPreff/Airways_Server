/*
  Warnings:

  - You are about to drop the column `amount` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "amount",
ADD COLUMN     "passangerLastName" TEXT,
ADD COLUMN     "passangerName" TEXT,
ADD COLUMN     "passangerPassportNumber" TEXT;

-- CreateIndex
CREATE INDEX "Flight_id_idx" ON "Flight"("id");

-- CreateIndex
CREATE INDEX "Flight_departure_time_idx" ON "Flight"("departure_time");

-- CreateIndex
CREATE INDEX "Order_id_idx" ON "Order"("id");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Ticket_id_idx" ON "Ticket"("id");

-- CreateIndex
CREATE INDEX "Ticket_orderId_idx" ON "Ticket"("orderId");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
