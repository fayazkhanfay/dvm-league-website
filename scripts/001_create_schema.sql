-- Create custom enum types
CREATE TYPE user_role AS ENUM ('gp', 'specialist');
CREATE TYPE case_status AS ENUM ('draft', 'pending_assignment', 'in_progress', 'completed', 'cancelled');
CREATE TYPE upload_phase AS ENUM ('initial_submission', 'diagnostic_results', 'specialist_report');

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  clinic_name TEXT,
  specialty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cases table
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status case_status NOT NULL DEFAULT 'pending_assignment',
  gp_id UUID NOT NULL REFERENCES public.profiles(id),
  specialist_id UUID REFERENCES public.profiles(id),
  specialty_requested TEXT,
  patient_name TEXT NOT NULL,
  patient_signalment JSONB NOT NULL,
  presenting_complaint TEXT NOT NULL,
  brief_history TEXT NOT NULL,
  pe_findings TEXT NOT NULL,
  medications TEXT NOT NULL,
  diagnostics_performed TEXT,
  treatments_attempted TEXT,
  gp_questions TEXT NOT NULL,
  phase1_plan TEXT,
  phase2_assessment TEXT,
  phase2_treatment_plan TEXT,
  phase2_prognosis TEXT,
  phase2_client_summary TEXT,
  report_due_description TEXT
);

-- Create case_files table
CREATE TABLE IF NOT EXISTS public.case_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES public.profiles(id),
  file_name TEXT NOT NULL,
  storage_object_path TEXT NOT NULL,
  file_type TEXT,
  upload_phase upload_phase,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for cases table
CREATE POLICY "GPs can view their own cases"
  ON public.cases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'gp'
      AND cases.gp_id = auth.uid()
    )
  );

CREATE POLICY "Specialists can view their assigned cases"
  ON public.cases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'specialist'
      AND cases.specialist_id = auth.uid()
    )
  );

CREATE POLICY "GPs can insert new cases"
  ON public.cases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'gp'
      AND cases.gp_id = auth.uid()
    )
  );

-- RLS Policies for case_files table
CREATE POLICY "Users can view files for their accessible cases"
  ON public.case_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = case_files.case_id
      AND (cases.gp_id = auth.uid() OR cases.specialist_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert files for their accessible cases"
  ON public.case_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = case_files.case_id
      AND (cases.gp_id = auth.uid() OR cases.specialist_id = auth.uid())
    )
    AND uploader_id = auth.uid()
  );

-- Create indexes for better query performance
CREATE INDEX idx_cases_gp_id ON public.cases(gp_id);
CREATE INDEX idx_cases_specialist_id ON public.cases(specialist_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_case_files_case_id ON public.case_files(case_id);
