-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'artist');

-- CreateTable
CREATE TABLE "user" (
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "psswd" TEXT NOT NULL,
    "google_id" TEXT,
    "biography" TEXT,
    "role" "Role" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_follows" (
    "follower_id" TEXT NOT NULL,
    "followed_id" TEXT NOT NULL,

    CONSTRAINT "user_follows_pkey" PRIMARY KEY ("follower_id")
);

-- CreateTable
CREATE TABLE "password_reset" (
    "psswd_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "password_reset_pkey" PRIMARY KEY ("psswd_id")
);

-- CreateTable
CREATE TABLE "social_media" (
    "sm_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "social_media_pkey" PRIMARY KEY ("sm_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_google_id_key" ON "user"("google_id");
