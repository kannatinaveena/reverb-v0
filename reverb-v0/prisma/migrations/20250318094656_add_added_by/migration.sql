/*
  Warnings:

  - You are about to drop the column `palyedTs` on the `Stream` table. All the data in the column will be lost.
  - Added the required column `addedById` to the `Stream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "palyedTs",
ADD COLUMN     "addedById" TEXT NOT NULL,
ADD COLUMN     "playedTs" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
