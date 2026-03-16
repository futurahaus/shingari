-- Run this SQL in Supabase SQL Editor if prisma migrate/db push fails due to permissions
-- Creates the home_carousel_slides table in public schema

CREATE TABLE IF NOT EXISTS "public"."home_carousel_slides" (
  "id" SERIAL PRIMARY KEY,
  "image_url" VARCHAR(500) NOT NULL,
  "link_url" VARCHAR(500),
  "title" VARCHAR(200),
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
