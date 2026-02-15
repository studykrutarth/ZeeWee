import Plot from "react-plotly.js";

const COLORS = {
  approved: "#16a34a",
  pending: "#eab308",
  rejected: "#dc2626",
};

export default function SleepBarChart({ data }) {
  const validData = data.filter((d) => d.duration > 0);
  return (
    <Plot
      data={[
        {
          x: validData.map((d) => d.date),
          y: validData.map((d) => d.duration),
          type: "bar",
          marker: {
            color: validData.map((d) => COLORS[d.status] || "#94a3b8"),
          },
        },
      ]}
      layout={{
        title: "Sleep Duration",
        font: { color: "#ffffff" },
        xaxis: {
          title: { text: "Date", font: { color: "#ffffff" } },
          tickfont: { color: "#ffffff" },
          gridcolor: "rgba(255,255,255,0.12)",
          zerolinecolor: "rgba(255,255,255,0.18)",
        },
        yaxis: {
          title: { text: "Hours", font: { color: "#ffffff" } },
          tickfont: { color: "#ffffff" },
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
        annotations: [{
          xref: "paper",
          yref: "y",
          x: 1,
          y: 6.5,
          xanchor: "right",
          yanchor: "bottom",
          text: "6.5h goal",
          showarrow: false,
          font: { color: "#ffffff", size: 12 },
        }],
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
      }}
      style={{ width: "100%" }}
    />
  );
}
