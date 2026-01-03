-- GymNexus Database Schema (Supabase/Postgres)
-- Run this in the Supabase SQL Editor if 'npm run dev' cannot sync.

CREATE TABLE IF NOT EXISTS "Gyms" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "subdomain" VARCHAR(255) NOT NULL UNIQUE,
  "logo" VARCHAR(255),
  "address" VARCHAR(255),
  "phone" VARCHAR(255),
  "email" VARCHAR(255),
  "status" VARCHAR(255) DEFAULT 'active',
  "plan" VARCHAR(255) DEFAULT 'starter',
  "maxMembers" INTEGER DEFAULT 100,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "trialEndsAt" TIMESTAMP WITH TIME ZONE,
  "primaryColor" VARCHAR(255) DEFAULT '#bef264',
  "secondaryColor" VARCHAR(255) DEFAULT '#1a1a1a',
  "features" JSON DEFAULT '["dashboard", "members", "trainers", "schedule", "settings"]'
);

CREATE TABLE IF NOT EXISTS "Admins" (
  "id" SERIAL PRIMARY KEY,
  "gymId" INTEGER NOT NULL REFERENCES "Gyms" ("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "role" VARCHAR(255) DEFAULT 'admin',
  "status" VARCHAR(255) DEFAULT 'active',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Users" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(255),
  "avatar" TEXT,
  "memberPhoto" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Members" (
  "id" SERIAL PRIMARY KEY,
  "gymId" INTEGER NOT NULL REFERENCES "Gyms" ("id") ON DELETE CASCADE,
  "userId" INTEGER NOT NULL REFERENCES "Users" ("id") ON DELETE CASCADE,
  "status" VARCHAR(255) DEFAULT 'Active',
  "suspended" BOOLEAN DEFAULT false,
  "suspensionReason" TEXT,
  "suspensionEndDate" TIMESTAMP WITH TIME ZONE,
  "joinDate" VARCHAR(255),
  "endDate" VARCHAR(255),
  "duration" VARCHAR(255),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE ("gymId", "userId")
);

CREATE TABLE IF NOT EXISTS "Trainers" (
  "id" SERIAL PRIMARY KEY,
  "gymId" INTEGER NOT NULL REFERENCES "Gyms" ("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "specialty" VARCHAR(255),
  "skills" TEXT,
  "rating" FLOAT,
  "singleSessionPrice" INTEGER,
  "packagePrice" INTEGER,
  "packageCount" INTEGER DEFAULT 10,
  "image" TEXT,
  "suspended" BOOLEAN DEFAULT false,
  "suspensionReason" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Classes" (
  "id" SERIAL PRIMARY KEY,
  "gymId" INTEGER NOT NULL REFERENCES "Gyms" ("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "trainer" VARCHAR(255),
  "time" VARCHAR(255),
  "duration" VARCHAR(255),
  "capacity" INTEGER,
  "booked" INTEGER DEFAULT 0,
  "color" VARCHAR(255),
  "day" VARCHAR(255),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Equipment" (
  "id" SERIAL PRIMARY KEY,
  "gymId" INTEGER NOT NULL REFERENCES "Gyms" ("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "brand" VARCHAR(255),
  "category" VARCHAR(255),
  "status" VARCHAR(255) DEFAULT 'Active',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Bookings" (
  "id" SERIAL PRIMARY KEY,
  "gymId" INTEGER NOT NULL REFERENCES "Gyms" ("id") ON DELETE CASCADE,
  "type" VARCHAR(255),
  "itemId" VARCHAR(255),
  "memberId" INTEGER,
  "date" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "CheckIns" (
  "id" SERIAL PRIMARY KEY,
  "gymId" INTEGER NOT NULL REFERENCES "Gyms" ("id") ON DELETE CASCADE,
  "memberId" INTEGER NOT NULL,
  "memberName" VARCHAR(255),
  "status" VARCHAR(255) NOT NULL,
  "reason" VARCHAR(255),
  "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "checkOutTime" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Specialties" (
  "id" SERIAL PRIMARY KEY,
  "gymId" INTEGER NOT NULL REFERENCES "Gyms" ("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ActivityLogs" (
  "id" SERIAL PRIMARY KEY,
  "gymId" INTEGER NOT NULL REFERENCES "Gyms" ("id") ON DELETE CASCADE,
  "adminName" VARCHAR(255),
  "action" VARCHAR(255) NOT NULL,
  "details" TEXT,
  "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
