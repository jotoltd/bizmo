"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  upsertPhase,
  deletePhase,
  upsertStep,
  deleteStep,
} from "@/lib/admin/actions";
import type { RoadmapPhase, RoadmapStep, AudienceTag } from "@/types";

// ── Phase Form ───────────────────────────────────────────

function PhaseForm({
  phase,
  onClose,
}: {
  phase?: RoadmapPhase;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="glass-panel space-y-4 p-5"
      action={(fd) => {
        startTransition(async () => {
          await upsertPhase(fd);
          onClose();
        });
      }}
    >
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
          <label className="text-xs text-slate-400">Sort Order</label>
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
          {phase ? "Update Phase" : "Create Phase"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Step Form ────────────────────────────────────────────

function StepForm({
  step,
  phases,
  onClose,
}: {
  step?: RoadmapStep;
  phases: RoadmapPhase[];
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="glass-panel space-y-4 p-5"
      action={(fd) => {
        startTransition(async () => {
          await upsertStep(fd);
          onClose();
        });
      }}
    >
      {step && <input type="hidden" name="id" value={step.id} />}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Phase</label>
          <select
            name="phase_id"
            defaultValue={step?.phase_id}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="">Select phase</option>
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
          <label className="text-xs text-slate-400">Sort Order</label>
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
        <label className="text-xs text-slate-400">Why (context)</label>
        <textarea
          name="why"
          defaultValue={step?.why ?? ""}
          rows={2}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400">How (one per line)</label>
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
          <label className="text-xs text-slate-400">Status</label>
          <select
            name="status"
            defaultValue={step?.status ?? "draft"}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Publish At</label>
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
            Mandatory
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {step ? "Update Step" : "Create Step"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Main Manager ─────────────────────────────────────────

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
  const [, startTransition] = useTransition();

  const phases = initialPhases;
  const steps = initialSteps;

  return (
    <div className="space-y-8">
      {/* Tags display */}
      <div className="glass-panel p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Audience Tags</h3>
        <div className="flex flex-wrap gap-2">
          {initialTags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* Phases */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Phases</h2>
          <Button
            onClick={() => {
              setEditingPhase(undefined);
              setShowPhaseForm(true);
            }}
            size="sm"
          >
            + Add Phase
          </Button>
        </div>

        {showPhaseForm && (
          <PhaseForm
            phase={editingPhase}
            onClose={() => {
              setShowPhaseForm(false);
              setEditingPhase(undefined);
            }}
          />
        )}

        <div className="space-y-3">
          {phases.map((phase) => {
            const phaseSteps = steps.filter((s) => s.phase_id === phase.id);
            return (
              <div key={phase.id} className="glass-panel p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {phase.title}
                    </h3>
                    {phase.description && (
                      <p className="text-sm text-slate-400">
                        {phase.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      Order: {phase.sort_order} · {phaseSteps.length} steps
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPhase(phase);
                        setShowPhaseForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        startTransition(() => deletePhase(phase.id));
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Steps within phase */}
                {phaseSteps.length > 0 && (
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    {phaseSteps.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">
                            #{step.sort_order}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {step.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase ${
                                  step.status === "published"
                                    ? "bg-green-500/20 text-green-400"
                                    : step.status === "scheduled"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-white/10 text-slate-400"
                                }`}
                              >
                                {step.status}
                              </span>
                              {step.mandatory && (
                                <span className="text-[0.6rem] text-electric font-semibold uppercase">
                                  Required
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingStep(step);
                              setShowStepForm(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              startTransition(() => deleteStep(step.id));
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Steps */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add Step</h2>
          <Button
            onClick={() => {
              setEditingStep(undefined);
              setShowStepForm(true);
            }}
            size="sm"
          >
            + Add Step
          </Button>
        </div>
        {showStepForm && (
          <StepForm
            step={editingStep}
            phases={phases}
            onClose={() => {
              setShowStepForm(false);
              setEditingStep(undefined);
            }}
          />
        )}
      </section>
    </div>
  );
}
