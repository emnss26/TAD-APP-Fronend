import React, { useRef, useState, useEffect } from "react";
import { ResponsivePie } from "@nivo/pie";

const DisciplinePlansPieChart = ({ disciplineCounts, onDisciplineClick }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 350 });

  // Observar tamaño del contenedor
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  // Mapeo a { id, value }
  const data = Array.isArray(disciplineCounts)
    ? disciplineCounts.map(d => ({ id: d.discipline, value: d.count }))
    : [];

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {/*
        Si no hay datos mostramos placeholder,
        de lo contrario el pie chart
      */}
      {data.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          No data
        </div>
      ) : (
        <ResponsivePie
          data={data}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
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
            <div
              style={{
                padding: "5px 10px",
                background: "rgba(0,0,0,0.75)",
                color: "white",
                borderRadius: "2px",
                fontSize: "12px",
              }}
            >
              <strong>{datum.id}</strong>: {datum.value} plans
            </div>
          )}
          onClick={datum => {
            if (onDisciplineClick) onDisciplineClick(datum.id);
          }}
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              translateY: 56,
              itemWidth: 100,
              itemHeight: 18,
              symbolSize: 18,
              symbolShape: "circle",
              itemTextColor: "#999",
            },
          ]}
        />
      )}
    </div>
  );
};

export default DisciplinePlansPieChart;
