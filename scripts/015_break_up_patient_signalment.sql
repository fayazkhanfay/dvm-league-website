-- Migration to break up patient_signalment JSONB into individual columns

-- Step 1: Add new columns to cases table
ALTER TABLE public.cases
ADD COLUMN patient_species TEXT,
ADD COLUMN patient_breed TEXT,
ADD COLUMN patient_age TEXT,
ADD COLUMN patient_sex_status TEXT,
ADD COLUMN patient_weight_kg NUMERIC(6,2),
ADD COLUMN patient_vax_status TEXT,
ADD COLUMN patient_preventatives TEXT[];

-- Step 2: Migrate existing data from JSONB to new columns
UPDATE public.cases
SET 
  patient_species = patient_signalment->>'species',
  patient_breed = patient_signalment->>'breed',
  patient_age = patient_signalment->>'age',
  patient_sex_status = patient_signalment->>'sex_status',
  patient_weight_kg = (patient_signalment->>'weight_kg')::NUMERIC,
  patient_vax_status = patient_signalment->>'vax_status',
  patient_preventatives = CASE 
    WHEN patient_signalment->'preventatives' IS NOT NULL 
    THEN ARRAY(SELECT jsonb_array_elements_text(patient_signalment->'preventatives'))
    ELSE NULL
  END
WHERE patient_signalment IS NOT NULL;

-- Step 3: Set NOT NULL constraints on required fields
ALTER TABLE public.cases
ALTER COLUMN patient_species SET NOT NULL,
ALTER COLUMN patient_breed SET NOT NULL,
ALTER COLUMN patient_age SET NOT NULL,
ALTER COLUMN patient_sex_status SET NOT NULL,
ALTER COLUMN patient_weight_kg SET NOT NULL;

-- Step 4: Drop the old JSONB column
ALTER TABLE public.cases
DROP COLUMN patient_signalment;

-- Step 5: Create indexes for commonly queried fields
CREATE INDEX idx_cases_species ON public.cases(patient_species);
CREATE INDEX idx_cases_breed ON public.cases(patient_breed);
