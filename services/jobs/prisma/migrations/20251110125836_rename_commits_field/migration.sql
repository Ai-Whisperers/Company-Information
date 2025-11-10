-- Rename commitsLast6h to commitsLastHour in RepositoryScan table
-- This migration preserves existing data while updating the field name
-- to accurately reflect that commits are counted from the last hour (not 6 hours)

ALTER TABLE "RepositoryScan" RENAME COLUMN "commitsLast6h" TO "commitsLastHour";
