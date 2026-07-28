/*
  Warnings:

  - A unique constraint covering the columns `[attendanceCode]` on the table `event` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "event_attendanceCode_key" ON "event"("attendanceCode");
