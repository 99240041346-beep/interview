-- Safe bootstrap for the existing Render database.
-- Existing User and LearningProgress tables are preserved.

CREATE TABLE IF NOT EXISTS "PracticeAttempt" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "total" INTEGER NOT NULL DEFAULT 10,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PracticeAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MockInterview" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "mode" TEXT NOT NULL DEFAULT 'text',
  "score" INTEGER NOT NULL DEFAULT 0,
  "feedback" TEXT NOT NULL DEFAULT '',
  "transcript" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MockInterview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Resume" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "extracted" TEXT NOT NULL DEFAULT '',
  "score" INTEGER NOT NULL DEFAULT 0,
  "feedback" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PracticeAttempt_userId_type_idx" ON "PracticeAttempt"("userId", "type");
CREATE INDEX IF NOT EXISTS "MockInterview_userId_createdAt_idx" ON "MockInterview"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Resume_userId_createdAt_idx" ON "Resume"("userId", "createdAt");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PracticeAttempt_userId_fkey') THEN
    ALTER TABLE "PracticeAttempt" ADD CONSTRAINT "PracticeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MockInterview_userId_fkey') THEN
    ALTER TABLE "MockInterview" ADD CONSTRAINT "MockInterview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Resume_userId_fkey') THEN
    ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
