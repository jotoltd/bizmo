"use client";

import { useState, useTransition, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  upsertPhase,
  deletePhase,
  upsertStep,
  deleteStep,
} from "@/lib/admin/actions";
import type { RoadmapPhase, RoadmapStep, AudienceTag } from "@/types";

const emptyStep: Partial<RoadmapStep> = {
  phase_id: "",
  title: "",
  description: "",
  why: "",
  how: [],
  affiliate_link: null,
  affiliate_name: null,
  mandatory: false,
  status: "draft",
  publish_at: null,
  sort_order: 0,
  time_estimate: null,
  difficulty: null,
  prerequisites: [],
  resources: [],
  common_pitfalls: [],
  success_criteria: null,
};

// ── Task Card (Memoized for speed) ───────────────────────

const TaskCard = memo(function TaskCard({
  step,
  onEdit,
  onDelete,
}: {
  step: RoadmapStep;
  onEdit: (step: RoadmapStep) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">#{step.sort_order}</span>
        <div>
          <p className="text-sm font-medium text-white">{step.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase ${
                step.status === "published"
                  ? "bg-green-500/20 text-green-400"
                  : step.status === "scheduled"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {step.status === "published" ? "Live" : step.status === "draft" ? "Hidden" : "Scheduled"}
            </span>
            {step.mandatory && (
              <span className="text-[0.6rem] text-electric font-semibold uppercase">Required</span>
            )}
            {step.affiliate_link && (
              <span className="text-[0.6rem] text-amber-400 font-semibold uppercase">Special Offer</span>
            )}
          </div>
          {step.affiliate_link && (
            <p className="text-[0.6rem] text-slate-500 mt-0.5">
              {step.affiliate_name || step.affiliate_link.slice(0, 40)}...
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(step)}>Edit</Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(step.id)} className="text-red-400 hover:text-red-300">Delete</Button>
      </div>
    </div>
  );
});

function PhaseForm({
  phase,
  onClose,
}: {
  phase?: RoadmapPhase;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  const handleSubmit = useCallback((fd: FormData) => {
    startTransition(async () => {
      await upsertPhase(fd);
      onClose();
    });
  }, [onClose]);

  return (
    <form className="glass-panel space-y-4 p-5" action={handleSubmit}>
      {phase && <input type="hidden" name="id" value={phase.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Title</label>
          <input
            name="title"
            defaultValue={phase?.title}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="e.g. Branding"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Position (order number)</label>
          <input
            name="sort_order"
            type="number"
            defaultValue={phase?.sort_order ?? 0}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-slate-400">Description</label>
        <textarea
          name="description"
          defaultValue={phase?.description ?? ""}
          rows={2}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
          placeholder="Optional description"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {phase ? "Save Section" : "Create Section"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Step Form (Optimized) ────────────────────────────────────────────

function StepForm({
  step,
  phaseId,
  phases,
  onClose,
}: {
  step?: RoadmapStep;
  phaseId?: string;
  phases: RoadmapPhase[];
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  const handleSubmit = useCallback((fd: FormData) => {
    startTransition(async () => {
      await upsertStep(fd);
      onClose();
    });
  }, [onClose]);

  return (
    <form className="glass-panel space-y-4 p-5" action={handleSubmit}>
      {step && <input type="hidden" name="id" value={step.id} />}
      <input type="hidden" name="phase_id" value={step?.phase_id || phaseId || ""} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Group</label>
          <select
            name="phase_id"
            defaultValue={step?.phase_id || phaseId}
            disabled={!!phaseId}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none disabled:opacity-50"
          >
            <option value="">Select a group</option>
            {phases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Title</label>
          <input
            name="title"
            defaultValue={step?.title}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="Step title"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Position</label>
          <input
            name="sort_order"
            type="number"
            defaultValue={step?.sort_order ?? 0}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400">Description</label>
        <textarea
          name="description"
          defaultValue={step?.description ?? ""}
          rows={2}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400">Why this matters (helps people understand)</label>
        <textarea
          name="why"
          defaultValue={step?.why ?? ""}
          rows={2}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400">How to do this (steps, one per line)</label>
        <textarea
          name="how"
          defaultValue={step?.how?.join("\n") ?? ""}
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
          placeholder="Step 1&#10;Step 2&#10;Step 3"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Time Estimate</label>
          <input
            name="time_estimate"
            defaultValue={step?.time_estimate ?? ""}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="e.g. 30 minutes"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Difficulty</label>
          <select
            name="difficulty"
            defaultValue={step?.difficulty ?? ""}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="">Select difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Success Criteria</label>
          <input
            name="success_criteria"
            defaultValue={step?.success_criteria ?? ""}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="How to know it's done"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400">Prerequisites (what should be done first, one per line)</label>
        <textarea
          name="prerequisites"
          defaultValue={step?.prerequisites?.join("\n") ?? ""}
          rows={2}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
          placeholder="Prerequisite 1&#10;Prerequisite 2"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400">Common Pitfalls (what to avoid, one per line)</label>
        <textarea
          name="common_pitfalls"
          defaultValue={step?.common_pitfalls?.join("\n") ?? ""}
          rows={2}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
          placeholder="Mistake to avoid 1&#10;Mistake to avoid 2"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400">Resources (format: Name|URL, one per line)</label>
        <textarea
          name="resources"
          defaultValue={step?.resources?.map(r => `${r.name}|${r.url}`).join("\n") ?? ""}
          rows={2}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
          placeholder="Helpful Tool|https://example.com&#10;Guide|https://guide.com"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Who can see this</label>
          <select
            name="status"
            defaultValue={step?.status ?? "draft"}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="draft">Hidden (draft)</option>
            <option value="published">Live (everyone can see)</option>
            <option value="scheduled">Scheduled (goes live later)</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Go live at (optional)</label>
          <input
            name="publish_at"
            type="datetime-local"
            defaultValue={step?.publish_at?.slice(0, 16) ?? ""}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          />
        </div>
        <div className="flex items-end gap-4 pb-1">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              name="mandatory"
              defaultChecked={step?.mandatory}
              className="accent-electric"
            />
            Must complete this
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Special offer link (optional)</label>
          <input
            name="affiliate_link"
            defaultValue={step?.affiliate_link ?? ""}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="https://shopify.com/..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Offer button text</label>
          <input
            name="affiliate_name"
            defaultValue={step?.affiliate_name ?? ""}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="Get 20% off with Shopify"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {step ? "Save Changes" : "Add Step"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Main Manager (Optimized) ─────────────────────────────────────────

export function RoadmapManager({
  initialPhases,
  initialSteps,
  initialTags,
}: {
  initialPhases: RoadmapPhase[];
  initialSteps: RoadmapStep[];
  initialTags: AudienceTag[];
}) {
  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const [editingPhase, setEditingPhase] = useState<RoadmapPhase | undefined>();
  const [showStepForm, setShowStepForm] = useState(false);
  const [editingStep, setEditingStep] = useState<RoadmapStep | undefined>();
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Memoize steps by phase for O(1) lookup
  const stepsByPhase = useMemo(() => {
    const map = new Map<string, RoadmapStep[]>();
    for (const step of initialSteps) {
      const list = map.get(step.phase_id) || [];
      list.push(step);
      map.set(step.phase_id, list);
    }
    // Sort each phase's steps
    for (const [phaseId, steps] of map) {
      map.set(phaseId, steps.sort((a, b) => a.sort_order - b.sort_order));
    }
    return map;
  }, [initialSteps]);

  const phases = initialPhases;
  const steps = initialSteps;

  // Memoized callbacks - stable references prevent re-renders
  const handleEditPhase = useCallback((phase: RoadmapPhase) => {
    setEditingPhase(phase);
    setShowPhaseForm(true);
  }, []);

  const handleDeletePhase = useCallback((id: string) => {
    if (confirm("Delete this section and all its tasks?")) {
      startTransition(() => deletePhase(id));
    }
  }, [startTransition]);

  const handleEditStep = useCallback((step: RoadmapStep) => {
    setEditingStep(step);
    setActivePhaseId(step.phase_id);
    setShowStepForm(true);
  }, []);

  const handleDeleteStep = useCallback((id: string) => {
    if (confirm("Delete this task?")) {
      startTransition(() => deleteStep(id));
    }
  }, [startTransition]);

  const handleClosePhaseForm = useCallback(() => {
    setShowPhaseForm(false);
    setEditingPhase(undefined);
  }, []);

  const handleCloseStepForm = useCallback(() => {
    setShowStepForm(false);
    setEditingStep(undefined);
    setActivePhaseId(null);
  }, []);

  const handleAddTask = useCallback((phaseId: string) => {
    setEditingStep({ ...emptyStep, phase_id: phaseId } as RoadmapStep);
    setActivePhaseId(phaseId);
    setShowStepForm(true);
  }, []);

  return (
    <div className="space-y-8">
      {/* Tags - moved to bottom as reference */}
      {initialTags.length > 0 && (
        <div className="glass-panel p-4 space-y-2">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Audience Tags</h3>
          <div className="flex flex-wrap gap-2">
            {initialTags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400"
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Sections</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {phases.length} section{phases.length !== 1 ? 's' : ''} · {steps.length} task{steps.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingPhase(undefined);
              setShowPhaseForm(true);
            }}
            size="sm"
          >
            + Add Section
          </Button>
        </div>

        {showPhaseForm && (
          <PhaseForm
            key={editingPhase?.id ?? "new-phase"}
            phase={editingPhase}
            onClose={handleClosePhaseForm}
          />
        )}

        <div className="space-y-3">
          {phases.map((phase) => {
            const phaseSteps = stepsByPhase.get(phase.id) || [];
            const isStepFormActive = showStepForm && activePhaseId === phase.id;
            return (
              <div key={phase.id} className="glass-panel p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
                    {phase.description && (
                      <p className="text-sm text-slate-400">{phase.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      Position: {phase.sort_order} · {phaseSteps.length} tasks
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditPhase(phase)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePhase(phase.id)} className="text-red-400 hover:text-red-300">Delete</Button>
                  </div>
                </div>

                {/* Steps within phase */}
                {phaseSteps.length > 0 && (
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    {phaseSteps.map((step) => (
                      <TaskCard
                        key={step.id}
                        step={step}
                        onEdit={handleEditStep}
                        onDelete={handleDeleteStep}
                      />
                    ))}
                  </div>
                )}
                
                {/* Inline Step Form */}
                {isStepFormActive && editingStep && (
                  <StepForm
                    key={editingStep.id ?? "new"}
                    step={editingStep.id ? editingStep : undefined}
                    phaseId={phase.id}
                    phases={phases}
                    onClose={handleCloseStepForm}
                  />
                )}

                {/* Add Task Button */}
                {!isStepFormActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddTask(phase.id)}
                    className="w-full mt-2 border border-dashed border-white/20 hover:border-electric/50 text-slate-400 hover:text-electric"
                  >
                    + Add task to this section
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
