import React from "react";
import { ResponsivePie } from "@nivo/pie";

const DisciplinePlansPieChart = ({
  data = [],
  onSliceClick,
  // Mantener firma, pero usar valores por defecto del diseño genérico
  innerRadius = 0.65,
  padAngle = 1,
  cornerRadius = 3,
  margin = { top: 10, right: 150, bottom: 10, left: 30 },
  legends = [
    {
      anchor: "right",
      direction: "column",
      translateX: 100,
      translateY: 0,
      itemsSpacing: 4,
      itemWidth: 60,
      itemHeight: 14,
      itemTextColor: "#000",
      symbolSize: 9,
      symbolShape: "circle",
    },
  ],
}) => {
  const chartData = data.map(d => ({ id: d.id, value: d.value }));

  return (
    <div style={{ height: 400, width: 350, margin: "1px auto" }}>
      {chartData.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          No data
        </div>
      ) : (
        <ResponsivePie
          data={chartData}
          innerRadius={innerRadius}
          padAngle={padAngle}
          // Offset al pasar el ratón
          activeOuterRadiusOffset={4}
          margin={margin}
          colors={["#00BCFF", "#0077b7", "#0c2c54", "#4eb3d3", "#6b7474"]}
          borderWidth={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
          // Desactivar líneas de enlace
          enableArcLinkLabels={false}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor="#ffffff"
          legends={legends}
          onClick={slice => onSliceClick?.(slice.id)}
        />
      )}
    </div>
  );
};

export default DisciplinePlansPieChart;