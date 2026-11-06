"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  GROUP_WEIGHTS,
  HAPLOGROUP_OPTIONS,
  scoreAlignment,
  type AlignmentResult,
  type Criterion,
  type CriterionGroup,
  type CriterionStatus,
  type Haplogroup,
} from "@/lib/kruse-alignment";
import type { PublicPlaceResult } from "@/lib/public-place";
import { formatPublicPlaceLabel } from "@/lib/public-place";
import type { SunPhases } from "@/lib/sun-phases";

const HAPLOGROUP_KEY = "mito-haplogroup";
const GROUP_ORDER: CriterionGroup[] = ["magnetism", "sun", "ground", "regional", "wireless"];
const STATUS_TEXT: Record<CriterionStatus, string> = {
  aligned: "Aligned",
  mixed: "Mixed",
  misaligned: "Misaligned",
  unknown: "No data",
};

/** Haplogroup choice, remembered in this browser only. */
export function useHaplogroup(): [Haplogroup, (next: Haplogroup) => void] {
  const [haplogroup, setHaplogroup] = useState<Haplogroup>("unknown");
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(HAPLOGROUP_KEY);
        if (HAPLOGROUP_OPTIONS.some((option) => option.id === stored)) {
          setHaplogroup(stored as Haplogroup);
        }
      } catch {
        // Storage is optional.
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);
  const update = (next: Haplogroup) => {
    setHaplogroup(next);
    try {
      window.localStorage.setItem(HAPLOGROUP_KEY, next);
    } catch {
      // Storage is optional.
    }
  };
  return [haplogroup, update];
}

/** Practice ids worth surfacing for what this place's readings show. */
export function recommendedPracticeIds(result: AlignmentResult): string[] {
  const frac = (id: string) => result.criteria.find((c) => c.id === id)?.fraction ?? null;
  const low = (id: string, below = 0.5) => {
    const f = frac(id);
    return f != null && f < below;
  };
  const ids: string[] = [];
  if (low("intensity") || low("inclination") || low("declination")) {
    ids.push("magnetic-sleep-pad", "north-south-bed");
  }
  if (low("drift", 0.6) || low("declination")) ids.push("track-your-field");
  const anchor = frac("anchor");
  if (anchor != null && anchor >= 0.5) ids.push("barefoot-earth", "copper-ring-basalt");
  if (low("uvb", 0.75) || low("latitude")) ids.push("four-phase-sun-day");
  if (low("wireless", 0.6)) ids.push("nnemf-reduction", "ground-floor-living");
  if (result.total != null && result.total < 65) ids.push("relocation-checklist");
  if (frac("anchor") != null && (frac("faults") ?? 1) < 0.5) ids.push("beeswax-candle-test");
  return [...new Set(ids)].slice(0, 6);
}

function StatusChip({ status }: { status: CriterionStatus }) {
  return (
    <span className={`alignment__chip alignment__chip--${status}`}>{STATUS_TEXT[status]}</span>
  );
}

function CriterionRow({ criterion }: { criterion: Criterion }) {
  return (
    <div className="alignment__row">
      <div className="alignment__head">
        <span className="alignment__label">{criterion.label}</span>
        <StatusChip status={criterion.status} />
        <span className="alignment__points">
          {criterion.points == null ? "–" : criterion.points.toFixed(1)} / {criterion.weight}
        </span>
      </div>
      <p className="alignment__value">{criterion.value}</p>
      <p className="alignment__why">{criterion.explanation}</p>
    </div>
  );
}

export function AlignmentSection({
  place,
  phases,
  haplogroup,
  onHaplogroup,
  actions,
}: {
  place: PublicPlaceResult;
  phases: SunPhases | null;
  haplogroup: Haplogroup;
  onHaplogroup: (next: Haplogroup) => void;
  actions?: ReactNode;
}) {
  const result = useMemo(
    () => scoreAlignment(place, phases ?? place.sunPhases, haplogroup),
    [place, phases, haplogroup],
  );

  return (
    <section className="alignment" aria-label="Kruse alignment">
      <p className="alignment__total">
        <strong>
          Kruse alignment: {result.total == null ? "n/a" : `${result.total} / 100`}
        </strong>
        {" · "}
        {result.label}
      </p>
      {result.total != null ? (
        <div
          className="alignment__bar"
          role="img"
          aria-label={`${result.total} out of 100`}
        >
          <span style={{ width: `${result.total}%` }} />
        </div>
      ) : null}
      {result.coverage < 0.95 ? (
        <p className="alignment__coverage">
          Scored on {Math.round(result.coverage * 100)}% of the criteria; some readings are
          unavailable right now.
        </p>
      ) : null}
      <p className="alignment__weights">
        Weighted as he teaches it:{" "}
        {GROUP_ORDER.filter((g) => result.criteria.some((c) => c.group === g))
          .map((g) => `${GROUP_WEIGHTS[g].label} ${GROUP_WEIGHTS[g].weight}`)
          .join(", ")}
        . The place&apos;s own magnetism counts most, then sun.
      </p>

      <label className="alignment__lineage">
        <span>Maternal haplogroup (optional, stays in this browser)</span>
        <select
          value={haplogroup}
          onChange={(event) => onHaplogroup(event.target.value as Haplogroup)}
        >
          {HAPLOGROUP_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {result.lineageNote ? <p className="alignment__lineage-note">{result.lineageNote}</p> : null}

      {GROUP_ORDER.map((groupId) => {
        const group = result.groups.find((g) => g.id === groupId)!;
        const rows = result.criteria.filter((c) => c.group === groupId);
        if (rows.length === 0) return null;
        return (
          <div className="alignment__group" key={groupId}>
            <p className="eyebrow">
              {group.label} · {Math.round(group.points)} of {group.scoredWeight}
            </p>
            {rows.map((row) => (
              <CriterionRow key={row.id} criterion={row} />
            ))}
          </div>
        );
      })}

      {result.namedPlaceNotes.length > 0 ? (
        <div className="alignment__group">
          <p className="eyebrow">Also from Kruse</p>
          {result.namedPlaceNotes.map((note) => (
            <p className="alignment__why" key={note}>
              {note}
            </p>
          ))}
        </div>
      ) : null}

      <p className="alignment__caveat">
        This is Dr. Kruse&apos;s framework turned into a score, not established science or
        medical advice. He also says that as the field turns turbulent, where you live now
        matters more than your lineage, and that the standard UV index says little about a
        place because it ignores declination and local deuterium. Readings use a ZIP-code
        centroid and the World Magnetic Model, not a measurement at your door.
      </p>

      {actions}
    </section>
  );
}

export function AlignmentCompare({
  place,
  haplogroup,
  onLookup,
}: {
  place: PublicPlaceResult;
  haplogroup: Haplogroup;
  onLookup: (zip: string) => Promise<PublicPlaceResult>;
}) {
  const [zip, setZip] = useState("");
  const [other, setOther] = useState<PublicPlaceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mine = useMemo(
    () => scoreAlignment(place, place.sunPhases, haplogroup),
    [place, haplogroup],
  );
  const theirs = useMemo(
    () => (other ? scoreAlignment(other, other.sunPhases, haplogroup) : null),
    [other, haplogroup],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      setOther(await onLookup(zip));
    } catch (lookupError) {
      setError(
        lookupError instanceof Error ? lookupError.message : "We could not resolve that ZIP code.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="alignment-compare" aria-label="Compare with another ZIP">
      <p className="eyebrow">Compare with another ZIP</p>
      <p className="dialog-note">
        Kruse often advises a two-to-three-month trial stay before a move. Compare a candidate
        place against this one, criterion by criterion.
      </p>
      <form className="zip-form__row" onSubmit={submit}>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          pattern="\d{5}(?:-?\d{4})?"
          maxLength={10}
          placeholder="Another ZIP"
          aria-label="ZIP code to compare"
          value={zip}
          onChange={(event) => setZip(event.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Reading…" : "Compare"}
        </button>
      </form>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      {other && theirs ? (
        <table className="alignment-compare__table">
          <thead>
            <tr>
              <th scope="col">Criterion</th>
              <th scope="col">{formatPublicPlaceLabel(place)}</th>
              <th scope="col">{formatPublicPlaceLabel(other)}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="alignment-compare__total">
              <th scope="row">Total</th>
              <td>{mine.total ?? "n/a"}</td>
              <td>{theirs.total ?? "n/a"}</td>
            </tr>
            {mine.criteria.map((criterion) => {
              const match = theirs.criteria.find((c) => c.id === criterion.id);
              return (
                <tr key={criterion.id}>
                  <th scope="row">{criterion.label}</th>
                  <td>
                    {criterion.points == null ? "–" : criterion.points.toFixed(1)}
                    <small> / {criterion.weight}</small>
                    <small className="alignment-compare__value">{criterion.value}</small>
                  </td>
                  <td>
                    {match?.points == null ? "–" : match.points.toFixed(1)}
                    <small> / {match?.weight ?? criterion.weight}</small>
                    <small className="alignment-compare__value">{match?.value ?? ""}</small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
