-- 1. Create the Timeline/Message Table
CREATE TABLE IF NOT EXISTS public.case_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT, -- Can be null if it's just a file upload event
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'system', 'report_phase1', 'report_phase2'
  is_internal BOOLEAN DEFAULT false, -- Future proofing for "Private Notes"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Security (RLS)
ALTER TABLE public.case_messages ENABLE ROW LEVEL SECURITY;

-- 3. RLS: Allow Participants (GP & Specialist) to READ the timeline
CREATE POLICY "Participants can view messages"
  ON public.case_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = case_messages.case_id
      AND (cases.gp_id = auth.uid() OR cases.specialist_id = auth.uid())
    )
  );

-- 4. RLS: Allow Participants to SEND messages
CREATE POLICY "Participants can send messages"
  ON public.case_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = case_messages.case_id
      AND (cases.gp_id = auth.uid() OR cases.specialist_id = auth.uid())
    )
    AND sender_id = auth.uid()
  );
