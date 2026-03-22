"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  toggleFeatureFlag,
  upsertFeatureFlag,
  upsertEmailTemplate,
  upsertSubscriptionPlan,
} from "@/lib/admin/actions";
import type { FeatureFlag, EmailTemplate, SubscriptionPlan } from "@/types";

// ── Feature Flag Form ────────────────────────────────────

function FlagForm({
  flag,
  onClose,
}: {
  flag?: FeatureFlag;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="glass-panel space-y-4 p-5"
      action={(fd) => {
        startTransition(async () => {
          await upsertFeatureFlag(fd);
          onClose();
        });
      }}
    >
      {flag && <input type="hidden" name="id" value={flag.id} />}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Key</label>
          <input
            name="key"
            defaultValue={flag?.key}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="feature_key"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Label</label>
          <input
            name="label"
            defaultValue={flag?.label}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="Feature Label"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={flag?.enabled ?? true}
              className="accent-electric"
            />
            Enabled
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {flag ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Email Template Form ──────────────────────────────────

function TemplateForm({
  template,
  onClose,
}: {
  template?: EmailTemplate;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="glass-panel space-y-4 p-5"
      action={(fd) => {
        startTransition(async () => {
          await upsertEmailTemplate(fd);
          onClose();
        });
      }}
    >
      {template && <input type="hidden" name="id" value={template.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Slug</label>
          <input
            name="slug"
            defaultValue={template?.slug}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="welcome"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Subject</label>
          <input
            name="subject"
            defaultValue={template?.subject}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="Welcome to Bizno!"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-slate-400">Body</label>
        <textarea
          name="body"
          defaultValue={template?.body}
          required
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
          placeholder="Hi {{name}}, ..."
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {template ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Plan Form ────────────────────────────────────────────

function PlanForm({
  plan,
  onClose,
}: {
  plan?: SubscriptionPlan;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="glass-panel space-y-4 p-5"
      action={(fd) => {
        startTransition(async () => {
          await upsertSubscriptionPlan(fd);
          onClose();
        });
      }}
    >
      {plan && <input type="hidden" name="id" value={plan.id} />}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Name</label>
          <input
            name="name"
            defaultValue={plan?.name}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
            placeholder="Pro"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Price (cents)</label>
          <input
            name="price_cents"
            type="number"
            defaultValue={plan?.price_cents ?? 0}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              name="active"
              defaultChecked={plan?.active ?? true}
              className="accent-electric"
            />
            Active
          </label>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-slate-400">Features (one per line)</label>
        <textarea
          name="features"
          defaultValue={plan?.features?.join("\n") ?? ""}
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-electric focus:outline-none"
          placeholder="Unlimited businesses&#10;Full checklist&#10;Priority support"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {plan ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Main Manager ─────────────────────────────────────────

export function SettingsManager({
  initialFlags,
  initialTemplates,
  initialPlans,
}: {
  initialFlags: FeatureFlag[];
  initialTemplates: EmailTemplate[];
  initialPlans: SubscriptionPlan[];
}) {
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | undefined>();
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | undefined>();
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | undefined>();
  const [, startTransition] = useTransition();

  return (
    <div className="space-y-10">
      {/* Feature Flags */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Feature Flags</h2>
          <Button
            size="sm"
            onClick={() => {
              setEditingFlag(undefined);
              setShowFlagForm(true);
            }}
          >
            + Add Flag
          </Button>
        </div>

        {showFlagForm && (
          <FlagForm
            flag={editingFlag}
            onClose={() => {
              setShowFlagForm(false);
              setEditingFlag(undefined);
            }}
          />
        )}

        <div className="space-y-2">
          {initialFlags.map((flag) => (
            <div
              key={flag.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-5 py-3"
            >
              <div>
                <p className="text-sm font-medium text-white">{flag.label}</p>
                <p className="text-xs text-slate-500 font-mono">{flag.key}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    startTransition(() =>
                      toggleFeatureFlag(flag.id, !flag.enabled)
                    );
                  }}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    flag.enabled ? "bg-electric" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      flag.enabled ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingFlag(flag);
                    setShowFlagForm(true);
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Email Templates */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Email Templates</h2>
          <Button
            size="sm"
            onClick={() => {
              setEditingTemplate(undefined);
              setShowTemplateForm(true);
            }}
          >
            + Add Template
          </Button>
        </div>

        {showTemplateForm && (
          <TemplateForm
            template={editingTemplate}
            onClose={() => {
              setShowTemplateForm(false);
              setEditingTemplate(undefined);
            }}
          />
        )}

        <div className="space-y-2">
          {initialTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="glass-panel p-5 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {tpl.subject}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">{tpl.slug}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTemplate(tpl);
                    setShowTemplateForm(true);
                  }}
                >
                  Edit
                </Button>
              </div>
              <p className="text-xs text-slate-400 whitespace-pre-wrap">
                {tpl.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Subscription Plans</h2>
          <Button
            size="sm"
            onClick={() => {
              setEditingPlan(undefined);
              setShowPlanForm(true);
            }}
          >
            + Add Plan
          </Button>
        </div>

        {showPlanForm && (
          <PlanForm
            plan={editingPlan}
            onClose={() => {
              setShowPlanForm(false);
              setEditingPlan(undefined);
            }}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {initialPlans.map((plan) => (
            <div key={plan.id} className="glass-panel p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-electric font-semibold">
                    {plan.price_cents === 0
                      ? "Free"
                      : `$${(plan.price_cents / 100).toFixed(2)}/mo`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase ${
                      plan.active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {plan.active ? "Active" : "Inactive"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingPlan(plan);
                      setShowPlanForm(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
              <ul className="space-y-1">
                {plan.features?.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="text-electric">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
