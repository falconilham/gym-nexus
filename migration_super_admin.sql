-- Allow Super Admins to not belong to a Gym
ALTER TABLE "Admins" ALTER COLUMN "gymId" DROP NOT NULL;
