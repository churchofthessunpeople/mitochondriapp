"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  deleteReminderAction,
  saveReminderAction,
} from "@/lib/actions/reminders";
import { useToast } from "@/components/toast";

type Reminder = {
  id: string;
  label: string;
  localTime: string;
  enabled: boolean;
};

type SunPresets = {
  sunrise?: string | null;
  sunset?: string | null;
  beforeSunset?: string | null;
  afterSunrise?: string | null;
};

export function RemindersClient({
  initial,
  sunPresets,
}: {
  initial: Reminder[];
  sunPresets?: SunPresets;
}) {
  const [items, setItems] = useState(initial);
  const [label, setLabel] = useState("Outdoor morning light");
  const [time, setTime] = useState(sunPresets?.afterSunrise || "07:30");
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(
    "default",
  );
  const [pending, start] = useTransition();
  const { push } = useToast();

  const presets = useMemo(() => {
    const list: { label: string; time: string; title: string }[] = [];
    if (sunPresets?.afterSunrise) {
      list.push({
        label: "After sunrise",
        time: sunPresets.afterSunrise,
        title: "Get outdoor morning light",
      });
    }
    if (sunPresets?.sunrise) {
      list.push({
        label: "At sunrise",
        time: sunPresets.sunrise,
        title: "Sunrise window",
      });
    }
    if (sunPresets?.beforeSunset) {
      list.push({
        label: "30 min before sunset",
        time: sunPresets.beforeSunset,
        title: "Catch sunset light",
      });
    }
    if (sunPresets?.sunset) {
      list.push({
        label: "At sunset",
        time: sunPresets.sunset,
        title: "Dim indoor LEDs",
      });
    }
    list.push({
      label: "Evening blue-light check",
      time: "20:00",
      title: "Blue-light hygiene",
    });
    return list;
  }, [sunPresets]);

  useEffect(() => {
    if (typeof Notification === "undefined") setPerm("unsupported");
    else setPerm(Notification.permission);
  }, []);

  useEffect(() => {
    if (perm !== "granted" || typeof window === "undefined") return;
    const id = window.setInterval(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const key = `${hh}:${mm}`;
      for (const r of items) {
        if (!r.enabled) continue;
        if (r.localTime !== key) continue;
        const flag = `rem-${r.id}-${now.toDateString()}`;
        if (sessionStorage.getItem(flag)) continue;
        sessionStorage.setItem(flag, "1");
        new Notification("Mitochondriapp", { body: r.label });
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [items, perm]);

  function requestPerm() {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission().then((p) => setPerm(p));
  }

  function add() {
    start(async () => {
      try {
        await saveReminderAction(label, time);
        push("Reminder saved");
        location.reload();
      } catch (e) {
        push(e instanceof Error ? e.message : "Failed", "err");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-4 text-sm">
        <p className="text-muted">
          Browser notifications on this device. Sun-relative presets use
          today&apos;s sunrise/sunset from your ZIP when available.
        </p>
        {perm !== "granted" && perm !== "unsupported" && (
          <button
            type="button"
            onClick={requestPerm}
            className="btn-primary mt-3 rounded-2xl px-4 py-2 text-sm font-semibold"
          >
            Enable notifications
          </button>
        )}
        {perm === "unsupported" && (
          <p className="mt-2 text-red-400">Notifications not supported here.</p>
        )}
      </div>

      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label + p.time}
              type="button"
              onClick={() => {
                setLabel(p.title);
                setTime(p.time);
              }}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
            >
              {p.label} · {p.time}
            </button>
          ))}
        </div>
      )}

      <div className="glass space-y-2 rounded-3xl p-4">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="field-input w-full rounded-xl px-3 py-2 text-sm"
          placeholder="Label"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="field-input w-full rounded-xl px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={pending}
          onClick={add}
          className="btn-primary h-11 w-full rounded-2xl text-sm font-semibold"
        >
          Save reminder
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between rounded-2xl border border-border px-3 py-2.5 text-sm"
          >
            <span>
              <span className="font-medium">{r.label}</span>
              <span className="ml-2 text-muted">{r.localTime}</span>
            </span>
            <button
              type="button"
              className="text-xs text-red-400"
              onClick={() => {
                start(async () => {
                  await deleteReminderAction(r.id);
                  setItems((prev) => prev.filter((x) => x.id !== r.id));
                });
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
