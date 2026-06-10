-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'AUDIO', 'VIDEO', 'PDF');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "EmotionLevel" AS ENUM ('LEVEL_1', 'LEVEL_2');

-- CreateTable
CREATE TABLE "Article" (
    "idArticle" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "presentationImageUrl" VARCHAR(500),
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3),
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Article_pkey" PRIMARY KEY ("idArticle")
);

-- CreateTable
CREATE TABLE "Media" (
    "idMedia" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "type" "MediaType" NOT NULL,
    "mediaUrl" VARCHAR(500) NOT NULL,
    "altText" VARCHAR(255),
    "caption" VARCHAR(255),
    "articleId" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("idMedia")
);

-- CreateTable
CREATE TABLE "Category" (
    "idCategory" TEXT NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(60) NOT NULL,
    "description" TEXT,
    "iconUrl" VARCHAR(255),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("idCategory")
);

-- CreateTable
CREATE TABLE "User" (
    "idUser" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "profilPictureUrl" VARCHAR(500),
    "email" VARCHAR(255) NOT NULL,
    "confirmationEmailAt" TIMESTAMP(3),
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "termsConsentAt" TIMESTAMP(3),
    "privacyConsentAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("idUser")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "idRefreshToken" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("idRefreshToken")
);

-- CreateTable
CREATE TABLE "Emotion" (
    "idEmotion" TEXT NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "iconUrl" VARCHAR(255),
    "level" "EmotionLevel" NOT NULL,
    "parentEmotionId" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Emotion_pkey" PRIMARY KEY ("idEmotion")
);

-- CreateTable
CREATE TABLE "MoodEntry" (
    "idMoodEntry" TEXT NOT NULL,
    "emotionDate" TIMESTAMP(3) NOT NULL,
    "parentEmotionIntensity" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "emotionId" TEXT NOT NULL,
    "feelingId" TEXT,

    CONSTRAINT "MoodEntry_pkey" PRIMARY KEY ("idMoodEntry")
);

-- CreateTable
CREATE TABLE "_ArticleToCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArticleToCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Media_mediaUrl_key" ON "Media"("mediaUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Category_title_key" ON "Category"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_jti_key" ON "RefreshToken"("jti");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_refreshToken_key" ON "RefreshToken"("refreshToken");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Emotion_title_key" ON "Emotion"("title");

-- CreateIndex
CREATE INDEX "MoodEntry_userId_idx" ON "MoodEntry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MoodEntry_userId_emotionDate_key" ON "MoodEntry"("userId", "emotionDate");

-- CreateIndex
CREATE INDEX "_ArticleToCategory_B_index" ON "_ArticleToCategory"("B");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("idArticle") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emotion" ADD CONSTRAINT "Emotion_parentEmotionId_fkey" FOREIGN KEY ("parentEmotionId") REFERENCES "Emotion"("idEmotion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodEntry" ADD CONSTRAINT "MoodEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodEntry" ADD CONSTRAINT "MoodEntry_emotionId_fkey" FOREIGN KEY ("emotionId") REFERENCES "Emotion"("idEmotion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodEntry" ADD CONSTRAINT "MoodEntry_feelingId_fkey" FOREIGN KEY ("feelingId") REFERENCES "Emotion"("idEmotion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToCategory" ADD CONSTRAINT "_ArticleToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Article"("idArticle") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToCategory" ADD CONSTRAINT "_ArticleToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("idCategory") ON DELETE CASCADE ON UPDATE CASCADE;
