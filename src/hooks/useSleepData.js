import { useEffect, useState } from "react";
import Papa from "papaparse";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQsxaDOj8yWJdaw3MHU5PhiI_9eAhIR2GhQjLM8jPFsxXPRvbV-HdFratVBBYGve-2ZL2QnRJQTo7P4/pub?output=csv";

const REQUIRED_FIELDS = ["date", "start", "end"];

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
    return new Date(1970, 0, 1, hours, minutes, 0, 0);
  }

  const twentyFourMatch = raw.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?$/);
  if (twentyFourMatch) {
    const hours = Number(twentyFourMatch[1]);
    const minutes = Number(twentyFourMatch[2] ?? 0);
    const seconds = Number(twentyFourMatch[3] ?? 0);
    return new Date(1970, 0, 1, hours, minutes, seconds, 0);
  }

  const fallback = new Date(`1970-01-01 ${raw}`);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export function useSleepData() {
  const [data, setData] = useState([]);

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
        }

        if (res.errors?.length) {
          console.error("[useSleepData] CSV parse errors", res.errors);
        }

        const rows = res.data
          .map((r, index) => {
            const start = parseTime(r.start);
            const end = parseTime(r.end);

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
              const safeEnd = new Date(end);
              if (safeEnd <= start) safeEnd.setDate(safeEnd.getDate() + 1);
              duration = Number(((safeEnd - start) / 36e5).toFixed(2));
            }

            return {
              date: r.date,
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
      },
      error: (err) => {
        console.error("[useSleepData] Failed to load sheet", err);
      },
    });
  }, []);

  return data;
}
