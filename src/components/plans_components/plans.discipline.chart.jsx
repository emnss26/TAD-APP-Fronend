// src/components/plans_components/plans.discipline.chart.jsx
import React, { useRef, useState, useEffect } from "react";
import { ResponsivePie } from "@nivo/pie";

const DisciplinePlansPieChart = ({
  data = [],                // <-- aquí
  onSliceClick,
  innerRadius = 0.5,
  padAngle = 0.7,
  cornerRadius = 3,
  margin = { top: 40, right: 80, bottom: 80, left: 80 },
  legends = [],
}) => {
  console.log("Discipline Plans Pie Chart Data:", data);
  const chartData = data.map(d => ({ id: d.id, value: d.value }));

  return (
    <div style={{ height: 500, width: 300, margin: "1px auto" }}>
      {chartData.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          No data
        </div>
      ) : (
        <ResponsivePie
          data={chartData}
          margin={margin}
          innerRadius={innerRadius}
          padAngle={padAngle}
          cornerRadius={cornerRadius}
          colors={{ scheme: "nivo" }}
          borderWidth={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          tooltip={({ datum }) => (
            <div style={{
              padding: "5px 10px",
              background: "rgba(0,0,0,0.75)",
              color: "white",
              borderRadius: "2px",
              fontSize: "12px",
            }}>
              <strong>{datum.id}</strong>: {datum.value} plans
            </div>
          )}
          onClick={datum => onSliceClick?.(datum.id)}
          legends={legends}
        />
      )}
    </div>
  );
};

export default DisciplinePlansPieChart;
