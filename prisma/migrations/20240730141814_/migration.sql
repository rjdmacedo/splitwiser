-- CreateTable
CREATE TABLE "_SettlementSplits" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_SettlementSplits_A_fkey" FOREIGN KEY ("A") REFERENCES "Settlement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SettlementSplits_B_fkey" FOREIGN KEY ("B") REFERENCES "Split" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_SettlementSplits_AB_unique" ON "_SettlementSplits"("A", "B");

-- CreateIndex
CREATE INDEX "_SettlementSplits_B_index" ON "_SettlementSplits"("B");
