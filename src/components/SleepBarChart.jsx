import Plot from "react-plotly.js";

const COLORS = {
  approved: "#16a34a",
  pending: "#eab308",
  rejected: "#dc2626",
};

export default function SleepBarChart({ data }) {
  return (
    <Plot
      data={[
        {
          x: data.map(d => d.date),
          y: data.map(d => d.duration),
          type: "bar",
          marker: { color: data.map(d => COLORS[d.status]) },
        },
      ]}
      layout={{
        title: "Sleep Duration",
        font: { color: "#ffffff" },
        xaxis: {
          tickfont: { color: "#ffffff" },
          titlefont: { color: "#ffffff" },
          gridcolor: "rgba(255,255,255,0.12)",
          zerolinecolor: "rgba(255,255,255,0.18)",
        },
        yaxis: {
          tickfont: { color: "#ffffff" },
          titlefont: { color: "#ffffff" },
          gridcolor: "rgba(255,255,255,0.12)",
          zerolinecolor: "rgba(255,255,255,0.18)",
        },
        shapes: [{
          type: "line",
          y0: 6.5,
          y1: 6.5,
          x0: 0,
          x1: 1,
          xref: "paper",
          line: { dash: "dash", color: "white" },
        }],
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
      }}
      style={{ width: "100%" }}
    />
  );
}
