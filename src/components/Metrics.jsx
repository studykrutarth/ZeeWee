export default function Metrics({ data }) {
  const GOAL_MIN = 6.5;
  const DEBT_GOAL = 7.5;
  const validData = data.filter((d) => d.duration > 0);
  const avg =
    validData.reduce((a, b) => a + b.duration, 0) / validData.length || 0;
  const variance = validData.length
    ? validData.reduce((sum, d) => sum + (d.duration - avg) ** 2, 0) /
      validData.length
    : 0;
  const stdDev = Math.sqrt(variance);
  const consistencyLabel = !validData.length
    ? "—"
    : stdDev < 0.75
    ? "High"
    : stdDev < 1.25
    ? "Medium"
    : "Low";
  const belowGoal = validData.filter((d) => d.duration < GOAL_MIN).length;
  const netDebt = validData.reduce(
    (sum, d) => sum + (DEBT_GOAL - d.duration),
    0
  );
  const sleepDebt = Math.max(0, netDebt);

  return (
    <div className="metrics">
      <div className="card">Avg Sleep<br /><b>{avg.toFixed(2)} hrs</b></div>
      <div className="card">Total Entries<br /><b>{data.length}</b></div>
      <div className="card">
        Below {GOAL_MIN}h<br />
        <b>{belowGoal}</b>
      </div>
      <div className="card">
        Consistency<br />
        <b>{consistencyLabel}</b>
        <div className="metric-sub">
          {validData.length ? `±${stdDev.toFixed(2)} hrs` : "No data"}
        </div>
      </div>
      <div className="card">
        Sleep Debt (offset by surplus)<br />
        <b>{sleepDebt.toFixed(2)} hrs</b>
      </div>
    </div>
  );
}
