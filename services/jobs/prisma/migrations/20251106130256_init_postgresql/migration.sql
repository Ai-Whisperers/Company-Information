-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "isPrivate" INTEGER NOT NULL DEFAULT 0,
    "starCount" INTEGER NOT NULL DEFAULT 0,
    "forkCount" INTEGER NOT NULL DEFAULT 0,
    "openIssues" INTEGER NOT NULL DEFAULT 0,
    "openPRs" INTEGER NOT NULL DEFAULT 0,
    "lastActivity" TIMESTAMP(3),
    "healthScore" INTEGER NOT NULL DEFAULT 0,
    "healthStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "hasProtection" INTEGER NOT NULL DEFAULT 0,
    "requiredChecks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "areaPath" TEXT,
    "iterationPath" TEXT,
    "assignedTo" TEXT,
    "organization" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkItemLink" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "workItemId" TEXT NOT NULL,
    "pullRequestId" TEXT,
    "commitSha" TEXT,
    "linkType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkItemLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthCheck" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "htmlContent" TEXT,
    "summary" TEXT,
    "repositoryId" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT,
    "syncType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "itemsProcessed" INTEGER NOT NULL DEFAULT 0,
    "itemsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "details" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "githubUsername" TEXT,
    "azureId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" INTEGER NOT NULL DEFAULT 1,
    "rules" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyResult" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "repositoryName" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "violations" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepositoryScan" (
    "id" TEXT NOT NULL,
    "repositoryName" TEXT NOT NULL,
    "fullName" TEXT,
    "repositoryUrl" TEXT,
    "visibility" TEXT,
    "defaultBranch" TEXT,
    "commitsLast6h" INTEGER NOT NULL DEFAULT 0,
    "openPrs" INTEGER NOT NULL DEFAULT 0,
    "stalePrs" INTEGER NOT NULL DEFAULT 0,
    "openIssues" INTEGER NOT NULL DEFAULT 0,
    "totalBranches" INTEGER NOT NULL DEFAULT 0,
    "healthScore" INTEGER NOT NULL,
    "lastUpdated" TIMESTAMP(3),
    "lastPushed" TIMESTAMP(3),
    "sizeKb" INTEGER,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "watchers" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "needsAttention" INTEGER NOT NULL DEFAULT 0,
    "hasStalePrs" INTEGER NOT NULL DEFAULT 0,
    "highIssueCount" INTEGER NOT NULL DEFAULT 0,
    "tooManyBranches" INTEGER NOT NULL DEFAULT 0,
    "inactive" INTEGER NOT NULL DEFAULT 0,
    "scanTimestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepositoryScan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_name_key" ON "Repository"("name");

-- CreateIndex
CREATE INDEX "WorkItemLink_workItemId_idx" ON "WorkItemLink"("workItemId");

-- CreateIndex
CREATE INDEX "WorkItemLink_repositoryId_idx" ON "WorkItemLink"("repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkItemLink_repositoryId_workItemId_pullRequestId_key" ON "WorkItemLink"("repositoryId", "workItemId", "pullRequestId");

-- CreateIndex
CREATE INDEX "HealthCheck_repositoryId_timestamp_idx" ON "HealthCheck"("repositoryId", "timestamp");

-- CreateIndex
CREATE INDEX "Report_type_year_week_idx" ON "Report"("type", "year", "week");

-- CreateIndex
CREATE UNIQUE INDEX "Report_type_week_year_key" ON "Report"("type", "week", "year");

-- CreateIndex
CREATE INDEX "SyncLog_syncType_status_idx" ON "SyncLog"("syncType", "status");

-- CreateIndex
CREATE INDEX "SyncLog_startedAt_idx" ON "SyncLog"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubUsername_key" ON "User"("githubUsername");

-- CreateIndex
CREATE UNIQUE INDEX "User_azureId_key" ON "User"("azureId");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_name_key" ON "Policy"("name");

-- CreateIndex
CREATE INDEX "PolicyResult_policyId_checkedAt_idx" ON "PolicyResult"("policyId", "checkedAt");

-- CreateIndex
CREATE INDEX "PolicyResult_repositoryName_branch_idx" ON "PolicyResult"("repositoryName", "branch");

-- CreateIndex
CREATE INDEX "RepositoryScan_repositoryName_idx" ON "RepositoryScan"("repositoryName");

-- CreateIndex
CREATE INDEX "RepositoryScan_scanTimestamp_idx" ON "RepositoryScan"("scanTimestamp");

-- CreateIndex
CREATE INDEX "RepositoryScan_needsAttention_idx" ON "RepositoryScan"("needsAttention");

-- CreateIndex
CREATE INDEX "RepositoryScan_healthScore_idx" ON "RepositoryScan"("healthScore");

-- CreateIndex
CREATE INDEX "RepositoryScan_repositoryName_scanTimestamp_idx" ON "RepositoryScan"("repositoryName", "scanTimestamp");

-- AddForeignKey
ALTER TABLE "WorkItemLink" ADD CONSTRAINT "WorkItemLink_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItemLink" ADD CONSTRAINT "WorkItemLink_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthCheck" ADD CONSTRAINT "HealthCheck_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncLog" ADD CONSTRAINT "SyncLog_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyResult" ADD CONSTRAINT "PolicyResult_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
