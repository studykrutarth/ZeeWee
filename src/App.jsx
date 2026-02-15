import { useMemo, useState } from "react";
import { useSleepData } from "./hooks/useSleepData";
import Metrics from "./components/Metrics";
import SleepBarChart from "./components/SleepBarChart";
import SleepLineChart from "./components/SleepLineChart";
import SleepTable from "./components/SleepTable";
import WeeklyHeatmap from "./components/WeeklyHeatmap";

function getISOWeekRange(weekValue) {
  const match = weekValue.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - (jan4Day - 1) + (week - 1) * 7);
  const start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getISOWeekValue(date) {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
  return `${temp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function App() {
  const { data, loading, error } = useSleepData();
  const [weekValue, setWeekValue] = useState("");
  const currentWeekValue = useMemo(() => getISOWeekValue(new Date()), []);

  const weekRange = useMemo(
    () => (weekValue ? getISOWeekRange(weekValue) : null),
    [weekValue]
  );

  const filteredData = useMemo(() => {
    if (!weekRange) return data;
    return data.filter(
      (d) => d.dateObj && d.dateObj >= weekRange.start && d.dateObj <= weekRange.end
    );
  }, [data, weekRange]);

  return (
    <div className="app">
      <h1>ZeeWee Sleep Dashboard</h1>
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="week-picker">Week</label>
          <input
            id="week-picker"
            className="filter-input"
            type="week"
            value={weekValue}
            onChange={(event) => setWeekValue(event.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button
            type="button"
            className={`filter-button${
              weekValue === currentWeekValue ? " is-active" : ""
            }`}
            onClick={() => setWeekValue(currentWeekValue)}
            aria-pressed={weekValue === currentWeekValue}
          >
            This week
          </button>
          <button
            type="button"
            className={`filter-button${weekValue ? "" : " is-active"}`}
            onClick={() => setWeekValue("")}
            disabled={!weekValue}
            aria-pressed={!weekValue}
          >
            All time
          </button>
        </div>
        <div className="filter-range">
          {weekRange
            ? `Showing ${formatDate(weekRange.start)} – ${formatDate(weekRange.end)}`
            : "Showing all time"}
        </div>
      </div>
      {loading && <div className="card status-card">Loading sleep data…</div>}
      {!loading && error && (
        <div className="card status-card error-card">{error}</div>
      )}
      {!loading && !error && weekRange && filteredData.length === 0 && (
        <div className="card status-card">No data for selected week.</div>
      )}
      <Metrics data={filteredData} />
      <div className="charts">
        <SleepBarChart data={filteredData} />
        <SleepLineChart data={filteredData} />
      </div>
      <h2 className="section-title">Weekly Heatmap</h2>
      <WeeklyHeatmap data={filteredData} />
      <SleepTable data={filteredData} />
    </div>
  );
}
