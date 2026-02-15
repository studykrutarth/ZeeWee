import { useEffect, useState } from "react";
import Papa from "papaparse";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQsxaDOj8yWJdaw3MHU5PhiI_9eAhIR2GhQjLM8jPFsxXPRvbV-HdFratVBBYGve-2ZL2QnRJQTo7P4/pub?output=csv";

const REQUIRED_FIELDS = ["date", "start", "end"];

function parseDate(value) {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    return new Date(year, month - 1, day);
  }

  const slashMatch = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (slashMatch) {
    let month = Number(slashMatch[1]);
    let day = Number(slashMatch[2]);
    let year = Number(slashMatch[3]);
    if (month > 12 && day <= 12) {
      [month, day] = [day, month];
    }
    if (year < 100) year += 2000;
    return new Date(year, month - 1, day);
  }

  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime())
    ? null
    : new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
}

function parseTime(value) {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const ampmMatch = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])$/);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = Number(ampmMatch[2] ?? 0);
    const isPm = ampmMatch[3].toLowerCase() === "pm";
    if (hours === 12) hours = 0;
    if (isPm) hours += 12;
    return { date: new Date(1970, 0, 1, hours, minutes, 0, 0), hasMeridiem: true };
  }

  const twentyFourMatch = raw.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?$/);
  if (twentyFourMatch) {
    const hours = Number(twentyFourMatch[1]);
    const minutes = Number(twentyFourMatch[2] ?? 0);
    const seconds = Number(twentyFourMatch[3] ?? 0);
    return { date: new Date(1970, 0, 1, hours, minutes, seconds, 0), hasMeridiem: false };
  }

  const fallback = new Date(`1970-01-01 ${raw}`);
  return Number.isNaN(fallback.getTime())
    ? null
    : { date: fallback, hasMeridiem: /am|pm/i.test(raw) };
}

function adjustAmbiguousOvernight(start, end, startMeta, endMeta) {
  if (!start || !end || !startMeta || !endMeta) return start;
  if (startMeta.hasMeridiem || endMeta.hasMeridiem) return start;
  if (end > start) return start;

  const adjusted = new Date(start);
  const hour = adjusted.getHours();
  if (hour === 12) {
    adjusted.setHours(0);
  } else if (hour < 12) {
    adjusted.setHours(hour + 12);
  }
  return adjusted;
}

export function useSleepData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      skipEmptyLines: true,
      complete: (res) => {
        const fields = (res.meta?.fields ?? []).map((field) =>
          field.trim().toLowerCase()
        );
        const missingFields = REQUIRED_FIELDS.filter(
          (field) => !fields.includes(field)
        );
        if (missingFields.length) {
          console.error(
            `[useSleepData] Missing columns: ${missingFields.join(", ")}`,
            { fields }
          );
          setError(`Missing columns: ${missingFields.join(", ")}`);
        }

        if (res.errors?.length) {
          console.error("[useSleepData] CSV parse errors", res.errors);
        }

        const rows = res.data
          .map((r, index) => {
            const startMeta = parseTime(r.start);
            const endMeta = parseTime(r.end);
            const start = startMeta?.date ?? null;
            const end = endMeta?.date ?? null;

            if (!r.date && !r.start && !r.end) return null;

            if (!start || !end) {
              console.warn("[useSleepData] Invalid time in row", {
                index,
                start: r.start,
                end: r.end,
              });
            }

            let duration = null;
            if (start && end) {
              const safeStart = adjustAmbiguousOvernight(
                new Date(start),
                new Date(end),
                startMeta,
                endMeta
              );
              const safeEnd = new Date(end);
              if (safeEnd <= safeStart) safeEnd.setDate(safeEnd.getDate() + 1);
              duration = Number(((safeEnd - safeStart) / 36e5).toFixed(2));
            }

            return {
              date: r.date,
              dateObj: parseDate(r.date),
              start: r.start,
              end: r.end,
              reason: r.reason || "",
              status: (r.status || "pending").toLowerCase(),
              duration: duration ?? 0,
            };
          })
          .filter(Boolean);

        console.info(`[useSleepData] Loaded ${rows.length} rows`);
        setData(rows);
        setLoading(false);
      },
      error: (err) => {
        console.error("[useSleepData] Failed to load sheet", err);
        setError("Failed to load sheet");
        setLoading(false);
      },
    });
  }, []);

  return { data, loading, error };
}
