-- Add language column to profiles table
ALTER TABLE user_profiles ADD COLUMN language text DEFAULT 'en';
