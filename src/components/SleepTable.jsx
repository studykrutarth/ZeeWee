export default function SleepTable({ data }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Start</th><th>End</th>
            <th>Hours</th><th>Reason</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => {
            const durationLabel =
              d.duration > 0 ? d.duration.toFixed(2) : "—";
            const statusLabel =
              d.status ? d.status[0].toUpperCase() + d.status.slice(1) : "—";
            const rowKey = `${d.date}-${d.start}-${d.end}-${i}`;
            return (
              <tr key={rowKey}>
                <td>{d.date}</td>
                <td>{d.start}</td>
                <td>{d.end}</td>
                <td>{durationLabel}</td>
                <td>{d.reason}</td>
                <td>{statusLabel}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
