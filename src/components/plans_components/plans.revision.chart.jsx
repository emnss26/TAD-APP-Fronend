// src/components/plans_components/plans.revision.chart.jsx
import React from "react";
import { ResponsivePie } from "@nivo/pie";

const RevisionPlansPieChart = ({
  data = [],                // <-- aquí también
  innerRadius = 0.5,
  padAngle = 0.7,
  cornerRadius = 3,
  margin = { top: 40, right: 80, bottom: 80, left: 80 },
  legends = [],
}) => {
  console.log("Revision Plans Pie Chart Data:", data);
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
          activeOuterRadiusOffset={8}
          borderWidth={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          legends={legends}
        />
      )}
    </div>
  );
};

export default RevisionPlansPieChart;
