-- Seed demo cases using actual user IDs from the profiles table
-- This script dynamically fetches GP and Specialist IDs based on their roles

DO $$
DECLARE
  v_gp_id uuid;
  v_specialist_id uuid;
BEGIN
  -- Get the GP user ID (first GP in the system)
  SELECT id INTO v_gp_id 
  FROM public.profiles 
  WHERE role = 'gp' 
  LIMIT 1;

  -- Get the Specialist user ID (first specialist in the system)
  SELECT id INTO v_specialist_id 
  FROM public.profiles 
  WHERE role = 'specialist' 
  LIMIT 1;

  -- Check if we found both users
  IF v_gp_id IS NULL THEN
    RAISE EXCEPTION 'No GP user found in profiles table. Please create demo users first.';
  END IF;

  IF v_specialist_id IS NULL THEN
    RAISE EXCEPTION 'No Specialist user found in profiles table. Please create demo users first.';
  END IF;

  -- Case DVML-001: Max - Cardiology case
  INSERT INTO public.cases (
    id,
    created_at,
    status,
    gp_id,
    specialist_id,
    specialty_requested,
    patient_name,
    patient_signalment,
    presenting_complaint,
    brief_history,
    pe_findings,
    medications,
    diagnostics_performed,
    treatments_attempted,
    gp_questions,
    phase1_plan,
    report_due_description
  ) VALUES (
    '10000000-0000-0000-0000-000000000001',
    '2025-01-15 10:00:00+00',
    'in_progress',
    v_gp_id,
    v_specialist_id,
    'Cardiology',
    'Max',
    '{"species": "Canine", "breed": "Golden Retriever", "age": "8y", "sex_status": "Male Neutered", "weight_kg": 35, "vax_status": "Up-to-Date", "preventatives": ["Flea/Tick", "Heartworm"]}',
    'Chronic cough and exercise intolerance for the past 3 months',
    'Owner reports Max has been coughing more frequently, especially at night and after exercise. He seems to tire more easily during walks and has been less interested in playing fetch.',
    'Grade III/VI systolic heart murmur heard best at the left apex. Increased respiratory effort. Mild abdominal distension.',
    'Enalapril 10mg PO q12h, Furosemide 20mg PO q12h, Pimobendan 5mg PO q12h',
    'Thoracic radiographs show cardiomegaly with pulmonary edema. CBC and chemistry panel within normal limits.',
    'Started on cardiac medications 2 weeks ago with some improvement in cough frequency.',
    'What is the best next step for diagnostic workup? Should we consider echocardiography? Are there any adjustments needed to the current medication regimen?',
    'Based on the clinical presentation and radiographic findings, I recommend the following Phase 1 diagnostic plan:\n\n1. Echocardiography to assess cardiac structure and function\n2. Pro-BNP test to evaluate severity of heart failure\n3. Blood pressure measurement\n4. ECG to rule out arrhythmias\n\nCurrent medications are appropriate. Consider increasing furosemide if respiratory signs persist.',
    'ASAP / Next AM'
  );

  -- Case DVML-002: Bella - Dermatology case
  INSERT INTO public.cases (
    id,
    created_at,
    status,
    gp_id,
    specialist_id,
    specialty_requested,
    patient_name,
    patient_signalment,
    presenting_complaint,
    brief_history,
    pe_findings,
    medications,
    diagnostics_performed,
    treatments_attempted,
    gp_questions
  ) VALUES (
    '10000000-0000-0000-0000-000000000002',
    '2025-01-18 14:30:00+00',
    'pending_assignment',
    v_gp_id,
    NULL, -- Not yet assigned to specialist
    'Dermatology',
    'Bella',
    '{"species": "Feline", "breed": "Domestic Shorthair", "age": "5y", "sex_status": "Female Spayed", "weight_kg": 4.5, "vax_status": "Up-to-Date", "preventatives": ["Flea/Tick"]}',
    'Chronic pruritus and hair loss for 6 months',
    'Bella has been excessively grooming and scratching, leading to patchy hair loss on her abdomen and inner thighs. No improvement with flea treatment.',
    'Bilaterally symmetric alopecia on ventral abdomen and medial thighs. Erythematous skin with some excoriations. No fleas or flea dirt observed.',
    'Revolution Plus (topical) monthly',
    'Skin scraping negative for mites. Fungal culture pending.',
    'Trial of hypoallergenic diet for 4 weeks showed no improvement.',
    'What are the most likely differential diagnoses? Should we pursue allergy testing? What treatment options would you recommend?'
  );

  -- Case DVML-003: Charlie - Internal Medicine case
  INSERT INTO public.cases (
    id,
    created_at,
    status,
    gp_id,
    specialist_id,
    specialty_requested,
    patient_name,
    patient_signalment,
    presenting_complaint,
    brief_history,
    pe_findings,
    medications,
    diagnostics_performed,
    treatments_attempted,
    gp_questions,
    report_due_description
  ) VALUES (
    '10000000-0000-0000-0000-000000000003',
    '2025-01-20 09:15:00+00',
    'in_progress',
    v_gp_id,
    v_specialist_id,
    'Internal Medicine',
    'Charlie',
    '{"species": "Feline", "breed": "Domestic Shorthair", "age": "12y", "sex_status": "Female Spayed", "weight_kg": 3.8, "vax_status": "Up-to-Date", "preventatives": []}',
    'Weight loss and increased thirst for 2 months',
    'Charlie has lost approximately 1kg over the past 2 months despite having a good appetite. Owner also reports increased water consumption and urination.',
    'Body condition score 3/9. Palpable thyroid nodule on right side. Otherwise unremarkable physical exam.',
    'None currently',
    'CBC shows mild lymphocytosis. Chemistry panel shows elevated T4 (8.5 µg/dL, reference 1.0-4.0).',
    'None yet',
    'Is this hyperthyroidism? What treatment options are available? Should we do any additional diagnostics before starting treatment?',
    '1-2 Business Days'
  );

  -- Completed cases for demo purposes
  INSERT INTO public.cases (
    id,
    created_at,
    status,
    gp_id,
    specialist_id,
    specialty_requested,
    patient_name,
    patient_signalment,
    presenting_complaint,
    brief_history,
    pe_findings,
    medications,
    diagnostics_performed,
    treatments_attempted,
    gp_questions,
    phase1_plan,
    phase2_assessment,
    phase2_treatment_plan
  ) VALUES (
    '10000000-0000-0000-0000-000000000004',
    '2024-12-10 11:00:00+00',
    'completed',
    v_gp_id,
    v_specialist_id,
    'Cardiology',
    'Luna',
    '{"species": "Canine", "breed": "Labrador Retriever", "age": "10y", "sex_status": "Female Spayed", "weight_kg": 28, "vax_status": "Up-to-Date", "preventatives": ["Heartworm"]}',
    'Syncope episodes',
    'Luna experienced two episodes of collapse in the past week.',
    'Heart murmur grade II/VI, otherwise normal.',
    'None',
    'ECG, Holter monitor',
    'None',
    'What is causing the syncope?',
    'Recommend echocardiography and 24-hour Holter monitoring.',
    'Holter revealed intermittent arrhythmia.',
    'Started on antiarrhythmic medication. Prognosis good with treatment.'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    '2024-12-15 15:30:00+00',
    'completed',
    v_gp_id,
    v_specialist_id,
    'Internal Medicine',
    'Rocky',
    '{"species": "Canine", "breed": "Mixed Breed", "age": "7y", "sex_status": "Male Neutered", "weight_kg": 22, "vax_status": "Up-to-Date", "preventatives": ["Flea/Tick", "Heartworm"]}',
    'Chronic vomiting',
    'Rocky has been vomiting intermittently for 3 weeks.',
    'Mild abdominal discomfort on palpation.',
    'Famotidine 10mg PO q12h',
    'Abdominal ultrasound, bloodwork',
    'Dietary modification',
    'What is the underlying cause?',
    'Recommend endoscopy and biopsies.',
    'Endoscopy revealed inflammatory bowel disease.',
    'Started on immunosuppressive therapy. Dietary management ongoing.'
  );

  RAISE NOTICE 'Successfully seeded 5 demo cases using GP ID: % and Specialist ID: %', v_gp_id, v_specialist_id;
END $$;
