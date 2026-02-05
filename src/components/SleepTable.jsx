export default function SleepTable({ data }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Date</th><th>Start</th><th>End</th>
          <th>Hours</th><th>Reason</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <tr key={i}>
            <td>{d.date}</td>
            <td>{d.start}</td>
            <td>{d.end}</td>
            <td>{d.duration}</td>
            <td>{d.reason}</td>
            <td>{d.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
