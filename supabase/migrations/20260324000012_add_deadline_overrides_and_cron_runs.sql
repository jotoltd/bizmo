CREATE TABLE IF NOT EXISTS public.business_task_deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.roadmap_steps(id) ON DELETE CASCADE,
  due_at timestamptz NOT NULL,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'system')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, task_id)
);

CREATE INDEX IF NOT EXISTS idx_business_task_deadlines_business_id
  ON public.business_task_deadlines(business_id);

CREATE INDEX IF NOT EXISTS idx_business_task_deadlines_due_at
  ON public.business_task_deadlines(due_at);

ALTER TABLE public.business_task_deadlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read deadlines for their businesses"
  ON public.business_task_deadlines FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_task_deadlines.business_id
        AND (
          b.user_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.business_memberships bm
            WHERE bm.business_id = b.id
              AND bm.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "Owners can manage deadlines"
  ON public.business_task_deadlines FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_task_deadlines.business_id
        AND b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_task_deadlines.business_id
        AND b.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS public.cron_job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'failure', 'unauthorized')),
  details jsonb NOT NULL DEFAULT '{}',
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_cron_job_runs_job_started
  ON public.cron_job_runs(job_name, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_cron_job_runs_status
  ON public.cron_job_runs(status, started_at DESC);

ALTER TABLE public.cron_job_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read cron runs"
  ON public.cron_job_runs FOR SELECT TO authenticated
  USING (public.is_admin());
