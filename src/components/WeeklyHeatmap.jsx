const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayIndex(date) {
  const day = date.getDay() || 7;
  return day - 1;
}

function formatKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatWeekLabel(date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatCellLabel(date, hours) {
  const dateLabel = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  if (!hours) return `${dateLabel}: no entry`;
  return `${dateLabel}: ${hours.toFixed(2)} hrs`;
}

function getHeatColor(hours) {
  if (!hours) return "rgba(148, 163, 184, 0.2)";
  const clamped = Math.max(0, Math.min(hours, 9));
  const t = clamped / 9;
  const hue = 210 - 70 * t;
  const light = 28 + 24 * t;
  return `hsl(${hue}, 65%, ${light}%)`;
}

function buildWeekMatrix(data) {
  const weeks = new Map();

  data.forEach((entry) => {
    if (!entry?.dateObj || entry.duration <= 0) return;
    const weekStart = startOfWeek(entry.dateObj);
    const key = formatKey(weekStart);
    if (!weeks.has(key)) {
      weeks.set(key, {
        start: weekStart,
        days: Array.from({ length: 7 }, () => ({ sum: 0, count: 0 })),
      });
    }
    const week = weeks.get(key);
    const idx = dayIndex(entry.dateObj);
    week.days[idx].sum += entry.duration;
    week.days[idx].count += 1;
  });

  return Array.from(weeks.values()).sort((a, b) => a.start - b.start);
}

export default function WeeklyHeatmap({ data, maxWeeks = 12 }) {
  const weeks = buildWeekMatrix(data);
  const visibleWeeks =
    weeks.length > maxWeeks ? weeks.slice(weeks.length - maxWeeks) : weeks;

  return (
    <div className="card heatmap-card">
      <div className="heatmap-scroll">
        <div className="heatmap-header">
          <div className="heatmap-corner">Week of</div>
          {DAY_LABELS.map((label) => (
            <div key={label} className="heatmap-day">
              {label}
            </div>
          ))}
        </div>
        {visibleWeeks.map((week) => {
          const weekKey = formatKey(week.start);
          return (
            <div key={weekKey} className="heatmap-row">
              <div className="heatmap-label">{formatWeekLabel(week.start)}</div>
              {week.days.map((day, idx) => {
                const hours = day.count ? day.sum / day.count : null;
                const cellDate = new Date(week.start);
                cellDate.setDate(week.start.getDate() + idx);
                return (
                  <div
                    key={`${weekKey}-${idx}`}
                    className="heatmap-cell"
                    style={{ backgroundColor: getHeatColor(hours) }}
                    title={formatCellLabel(cellDate, hours)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="heatmap-legend">
        <span className="legend-label">Low</span>
        {[0, 3, 5.5, 7.5, 9].map((value) => (
          <span
            key={value}
            className="legend-swatch"
            style={{ backgroundColor: getHeatColor(value) }}
          />
        ))}
        <span className="legend-label">High</span>
      </div>
    </div>
  );
}
