"use client";

import { useState, useTransition } from "react";
import { CircleHelp, X } from "lucide-react";
import { useAppContentOptional } from "@/components/app-content-context";
import { MitoArticleModal } from "@/components/mito-article-modal";
import {
  MAGNETICO_GAUSS_OPTIONS,
  MAGNETICO_GAUSS_POINTS,
  formatMagneticoGauss,
  type MagneticoGauss,
} from "@/lib/magnetico";
import {
  SLEEP_ROOM_TEMP_OPTIONS,
  formatSleepRoomTemp,
  pointsForSleepRoomTemp,
  type SleepRoomTempF,
} from "@/lib/sleep-room-temp";
import {
  SLEEP_SPACE_FLAT_POINTS,
  SLEEP_SPACE_OPTION_META,
  WORK_SPACE_FLAT_POINTS,
  WORK_SPACE_OPTION_META,
  pointsForSleepSpace,
  pointsForWorkSpace,
  type SleepSpaceConfig,
  type SleepSpaceOptionId,
  type WorkSpaceConfig,
  type WorkSpaceOptionId,
} from "@/lib/space-hygiene";
import { cn } from "@/lib/utils";

type SleepProps = {
  kind: "sleep";
  initialConfig: SleepSpaceConfig;
  magneticoGauss: MagneticoGauss;
  sleepRoomTempF: SleepRoomTempF;
  onSave: (input: {
    config: SleepSpaceConfig;
    magneticoGauss: MagneticoGauss;
    sleepRoomTempF: SleepRoomTempF;
  }) => Promise<void>;
  onClose: () => void;
};

type WorkProps = {
  kind: "work";
  initialConfig: WorkSpaceConfig;
  onSave: (input: { config: WorkSpaceConfig }) => Promise<void>;
  onClose: () => void;
};

type Props = SleepProps | WorkProps;

type OptionHowTo = {
  label: string;
  how: string;
  articleId?: string;
};

function SpaceOptionHowToDialog({
  option,
  onClose,
}: {
  option: OptionHowTo;
  onClose: () => void;
}) {
  const content = useAppContentOptional();
  const [articleOpen, setArticleOpen] = useState(false);
  const paragraphs = option.how.split(/\n\n+/).filter(Boolean);
  const article = option.articleId
    ? content?.mitoEntries.find((e) => e.id === option.articleId)
    : undefined;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center"
        role="dialog"
        aria-modal
        aria-labelledby="space-option-how-to-title"
        onClick={onClose}
      >
        <div
          className="glass max-h-[min(85vh,32rem)] w-full max-w-sm overflow-y-auto rounded-3xl p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2">
            <p
              id="space-option-how-to-title"
              className="font-semibold leading-snug"
            >
              {option.label}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1 text-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
          </div>
          {article ? (
            <button
              type="button"
              className="mt-4 w-full rounded-2xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-foreground/5"
              onClick={() => setArticleOpen(true)}
            >
              Learn more
            </button>
          ) : null}
        </div>
      </div>
      {article && articleOpen ? (
        <MitoArticleModal
          entry={article}
          pillarLabel={
            content?.mitoPillarLabels?.[article.pillar] ?? article.pillar
          }
          onClose={() => setArticleOpen(false)}
        />
      ) : null}
    </>
  );
}

function ToggleRow(props: {
  label: string;
  detail: string;
  pointsLabel: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  onHowTo: () => void;
  children?: React.ReactNode;
}) {
  return (
    <li className="rounded-2xl border border-border bg-foreground/[0.02] p-3">
      <div className="flex items-start gap-2">
        <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-[var(--accent)]"
            checked={props.checked}
            disabled={props.disabled}
            onChange={(e) => props.onChange(e.target.checked)}
          />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium text-foreground">{props.label}</span>
              <span className="text-xs text-muted">{props.pointsLabel}</span>
            </span>
            <span className="mt-0.5 block text-sm text-muted">{props.detail}</span>
          </span>
        </label>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            props.onHowTo();
          }}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border text-muted transition hover:border-accent/40 hover:text-accent"
          aria-label={`How to: ${props.label}`}
          title="How to"
        >
          <CircleHelp className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      </div>
      {props.checked && props.children ? (
        <div className="mt-3 border-t border-border/60 pt-3">{props.children}</div>
      ) : null}
    </li>
  );
}

export function SpaceHygieneDialog(props: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [howTo, setHowTo] = useState<OptionHowTo | null>(null);

  const [sleepConfig, setSleepConfig] = useState<SleepSpaceConfig>(() =>
    props.kind === "sleep" ? props.initialConfig : ({} as SleepSpaceConfig),
  );
  const [workConfig, setWorkConfig] = useState<WorkSpaceConfig>(() =>
    props.kind === "work" ? props.initialConfig : ({} as WorkSpaceConfig),
  );
  const [gauss, setGauss] = useState<MagneticoGauss>(() =>
    props.kind === "sleep" ? props.magneticoGauss : 10,
  );
  const [tempF, setTempF] = useState<SleepRoomTempF>(() =>
    props.kind === "sleep" ? props.sleepRoomTempF : 65,
  );

  const title = props.kind === "sleep" ? "Sleep Space" : "Work Space";
  const total =
    props.kind === "sleep"
      ? pointsForSleepSpace(sleepConfig, {
          magneticoGauss: gauss,
          sleepRoomTempF: tempF,
        })
      : pointsForWorkSpace(workConfig);

  function setSleepOption(id: SleepSpaceOptionId, on: boolean) {
    setSleepConfig((c) => ({ ...c, [id]: on }));
  }

  function setWorkOption(id: WorkSpaceOptionId, on: boolean) {
    setWorkConfig((c) => ({ ...c, [id]: on }));
  }

  function save() {
    setError(null);
    start(async () => {
      try {
        if (props.kind === "sleep") {
          await props.onSave({
            config: sleepConfig,
            magneticoGauss: gauss,
            sleepRoomTempF: tempF,
          });
        } else {
          await props.onSave({ config: workConfig });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save");
      }
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center">
        <div
          role="dialog"
          aria-modal
          aria-labelledby="space-hygiene-title"
          className="glass flex max-h-[min(92vh,40rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl"
        >
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <p id="space-hygiene-title" className="font-semibold">
                {title}
              </p>
              <p className="text-sm text-muted">
                Enable what you actually run. Score is the sum of options (
                {total} pts).
              </p>
            </div>
            <button
              type="button"
              className="rounded-full p-2 text-muted hover:bg-foreground/5 hover:text-foreground"
              aria-label="Close"
              onClick={props.onClose}
            >
              <X className="size-5" />
            </button>
          </div>

          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
            {props.kind === "sleep"
              ? SLEEP_SPACE_OPTION_META.map((opt) => {
                  const flat =
                    opt.id === "coolBedroom" || opt.id === "magnetico"
                      ? null
                      : SLEEP_SPACE_FLAT_POINTS[opt.id];
                  const pointsLabel =
                    opt.id === "coolBedroom"
                      ? `${pointsForSleepRoomTemp(tempF)} pts`
                      : opt.id === "magnetico"
                        ? `${MAGNETICO_GAUSS_POINTS[gauss]} pts`
                        : `${flat} pts`;
                  return (
                    <ToggleRow
                      key={opt.id}
                      label={opt.label}
                      detail={opt.detail}
                      pointsLabel={pointsLabel}
                      checked={sleepConfig[opt.id]}
                      disabled={pending}
                      onChange={(on) => setSleepOption(opt.id, on)}
                      onHowTo={() =>
                        setHowTo({
                          label: opt.label,
                          how: opt.how,
                          articleId: opt.articleId,
                        })
                      }
                    >
                      {opt.id === "coolBedroom" ? (
                        <div className="flex flex-wrap gap-2">
                          {SLEEP_ROOM_TEMP_OPTIONS.map((t) => (
                            <button
                              key={t}
                              type="button"
                              disabled={pending}
                              onClick={() => setTempF(t)}
                              className={cn(
                                "rounded-full px-3 py-1.5 text-sm",
                                t === tempF
                                  ? "bg-foreground text-background"
                                  : "bg-foreground/5 text-foreground hover:bg-foreground/10",
                              )}
                            >
                              {formatSleepRoomTemp(t)} ·{" "}
                              {pointsForSleepRoomTemp(t)}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      {opt.id === "magnetico" ? (
                        <div className="flex flex-wrap gap-2">
                          {MAGNETICO_GAUSS_OPTIONS.map((g) => (
                            <button
                              key={g}
                              type="button"
                              disabled={pending}
                              onClick={() => setGauss(g)}
                              className={cn(
                                "rounded-full px-3 py-1.5 text-sm",
                                g === gauss
                                  ? "bg-foreground text-background"
                                  : "bg-foreground/5 text-foreground hover:bg-foreground/10",
                              )}
                            >
                              {formatMagneticoGauss(g)} ·{" "}
                              {MAGNETICO_GAUSS_POINTS[g]}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </ToggleRow>
                  );
                })
              : WORK_SPACE_OPTION_META.map((opt) => (
                  <ToggleRow
                    key={opt.id}
                    label={opt.label}
                    detail={opt.detail}
                    pointsLabel={`${WORK_SPACE_FLAT_POINTS[opt.id]} pts`}
                    checked={workConfig[opt.id]}
                    disabled={pending}
                    onChange={(on) => setWorkOption(opt.id, on)}
                    onHowTo={() =>
                      setHowTo({
                        label: opt.label,
                        how: opt.how,
                        articleId: opt.articleId,
                      })
                    }
                  />
                ))}
          </ul>

          <div className="border-t border-border px-4 py-3">
            {error ? (
              <p className="mb-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              disabled={pending}
              onClick={save}
              className="w-full rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-background disabled:opacity-60"
            >
              {pending ? "Saving…" : `Save · ${total} pts`}
            </button>
          </div>
        </div>
      </div>

      {howTo ? (
        <SpaceOptionHowToDialog option={howTo} onClose={() => setHowTo(null)} />
      ) : null}
    </>
  );
}
