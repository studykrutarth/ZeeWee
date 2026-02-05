export default function Metrics({ data }) {
  const avg =
    data.reduce((a, b) => a + b.duration, 0) / data.length || 0;

  return (
    <div className="metrics">
      <div className="card">Avg Sleep<br /><b>{avg.toFixed(2)} hrs</b></div>
      <div className="card">Total Entries<br /><b>{data.length}</b></div>
      <div className="card">
        Below 6.5h<br />
        <b>{data.filter(d => d.duration < 6.5).length}</b>
      </div>
    </div>
  );
}
