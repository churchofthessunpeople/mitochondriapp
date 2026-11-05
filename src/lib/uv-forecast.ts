/**
 * Real UV index (clouds, ozone, altitude, aerosols included) from Open-Meteo's
 * free forecast API, plus pure helpers the client uses to read it at any
 * moment. The geometric model in sun-phases.ts is the fallback.
 */

export const UV_SOURCE = "Open-Meteo (CAMS / ECMWF ozone, cloud and aerosol model)";

/** Compact hourly series; `times` are unix milliseconds (UTC). */
export type UvForecast = {
  times: number[];
  /** UV index with forecast clouds, ozone and aerosols. */
  uv: number[];
  /** UV index with a cloudless sky (still ozone, altitude, aerosols). */
  clearSky: number[];
  source: string;
};

type OpenMeteoResponse = {
  hourly?: {
    time?: number[];
    uv_index?: Array<number | null>;
    uv_index_clear_sky?: Array<number | null>;
  };
};

export async function fetchUvForecast(
  latitude: number,
  longitude: number,
): Promise<UvForecast | null> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", latitude.toFixed(3));
    url.searchParams.set("longitude", longitude.toFixed(3));
    url.searchParams.set("hourly", "uv_index,uv_index_clear_sky");
    url.searchParams.set("timezone", "GMT");
    url.searchParams.set("timeformat", "unixtime");
    url.searchParams.set("past_days", "1");
    url.searchParams.set("forecast_days", "3");
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as OpenMeteoResponse;
    const time = data.hourly?.time;
    const uv = data.hourly?.uv_index;
    const clear = data.hourly?.uv_index_clear_sky;
    if (!time || !uv || !clear || time.length < 2) return null;

    const times: number[] = [];
    const uvOut: number[] = [];
    const clearOut: number[] = [];
    for (let i = 0; i < time.length; i++) {
      const u = uv[i];
      const c = clear[i];
      if (typeof u !== "number" || typeof c !== "number") continue;
      times.push(time[i]! * 1000);
      uvOut.push(Math.max(0, u));
      clearOut.push(Math.max(0, c));
    }
    if (times.length < 2) return null;
    return { times, uv: uvOut, clearSky: clearOut, source: UV_SOURCE };
  } catch {
    return null;
  }
}

function interpolate(times: number[], values: number[], at: number): number | null {
  if (at < times[0]! || at > times[times.length - 1]!) return null;
  let lo = 0;
  let hi = times.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (times[mid]! <= at) lo = mid;
    else hi = mid;
  }
  const span = times[hi]! - times[lo]!;
  const f = span > 0 ? (at - times[lo]!) / span : 0;
  return values[lo]! + (values[hi]! - values[lo]!) * f;
}

/** Forecast UV index at an instant (linear between hourly points), or null if outside the series. */
export function uvForecastAt(
  forecast: UvForecast,
  at: Date,
): { uv: number; clearSky: number } | null {
  const t = at.getTime();
  const uv = interpolate(forecast.times, forecast.uv, t);
  const clear = interpolate(forecast.times, forecast.clearSky, t);
  return uv == null || clear == null ? null : { uv, clearSky: clear };
}

export type UvDaySummary = {
  peakUv: number;
  peakAt: string;
  /** Hours (to the nearest 0.25) with UV index at or above 3, the usual sun-protection / vitamin D threshold. */
  hoursAtOrAbove3: number;
  /** First and last time UV index is at or above 3, if any. */
  usefulWindow: { start: string; end: string } | null;
};

/** Summarise the forecast between two instants (e.g. sunrise to sunset). */
export function summarizeUvDay(
  forecast: UvForecast,
  from: Date,
  to: Date,
): UvDaySummary | null {
  const step = 5 * 60_000;
  let peakUv = -1;
  let peakAt = from.getTime();
  let above = 0;
  let first: number | null = null;
  let last: number | null = null;
  let seen = false;
  for (let t = from.getTime(); t <= to.getTime(); t += step) {
    const v = uvForecastAt(forecast, new Date(t));
    if (!v) continue;
    seen = true;
    if (v.uv > peakUv) {
      peakUv = v.uv;
      peakAt = t;
    }
    if (v.uv >= 3) {
      above += step;
      first ??= t;
      last = t;
    }
  }
  if (!seen) return null;
  return {
    peakUv,
    peakAt: new Date(peakAt).toISOString(),
    hoursAtOrAbove3: Math.round((above / 3_600_000) * 4) / 4,
    usefulWindow:
      first != null && last != null
        ? { start: new Date(first).toISOString(), end: new Date(last).toISOString() }
        : null,
  };
}

/** WHO UV index exposure category. */
export function uvCategory(uv: number): string {
  if (uv < 0.5) return "none";
  if (uv < 3) return "low";
  if (uv < 6) return "moderate";
  if (uv < 8) return "high";
  if (uv < 11) return "very high";
  return "extreme";
}
