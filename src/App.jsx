import { useSleepData } from "./hooks/useSleepData";
import Metrics from "./components/Metrics";
import SleepBarChart from "./components/SleepBarChart";
import SleepLineChart from "./components/SleepLineChart";
import SleepTable from "./components/SleepTable";

export default function App() {
  const data = useSleepData();

  return (
    <div className="app">
      <h1>🛌 Sleep Dashboard</h1>
      <Metrics data={data} />
      <div className="charts">
        <SleepBarChart data={data} />
        <SleepLineChart data={data} />
      </div>
      <SleepTable data={data} />
    </div>
  );
}
