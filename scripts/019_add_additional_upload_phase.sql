-- Add 'additional' value to upload_phase enum for chat attachments
-- This allows files to be uploaded via chat that aren't tied to a specific submission phase

ALTER TYPE upload_phase ADD VALUE 'additional';
