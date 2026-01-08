-- Migration to make non-critical fields nullable for draft functionality
-- This allows GPs to save drafts with only patient_name filled in

-- Remove NOT NULL constraints from patient signalment fields (except patient_name)
ALTER TABLE public.cases
ALTER COLUMN patient_species DROP NOT NULL,
ALTER COLUMN patient_breed DROP NOT NULL,
ALTER COLUMN patient_age DROP NOT NULL,
ALTER COLUMN patient_sex_status DROP NOT NULL,
ALTER COLUMN patient_weight_kg DROP NOT NULL;

-- Remove NOT NULL constraints from case detail fields
ALTER TABLE public.cases
ALTER COLUMN presenting_complaint DROP NOT NULL,
ALTER COLUMN brief_history DROP NOT NULL,
ALTER COLUMN pe_findings DROP NOT NULL,
ALTER COLUMN medications DROP NOT NULL,
ALTER COLUMN gp_questions DROP NOT NULL;

-- Note: patient_name, gp_id, and status remain NOT NULL as required
