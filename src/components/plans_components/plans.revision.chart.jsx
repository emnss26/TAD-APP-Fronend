import React, { useRef, useState, useEffect } from 'react';
import { ResponsivePie } from '@nivo/pie';

const RevisionPlansPieChart = ({ data }) => {
  const container = useRef();
  const [dims, setDims] = useState({ width: 300, height: 300 });

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ width, height });
    });
    if (container.current) obs.observe(container.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={container}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      {/*
        Si no hay datos mostramos placeholder,
        de lo contrario el pie chart
      */}
      {!Array.isArray(data) || data.length === 0 ? (
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
          activeOuterRadiusOffset={8}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
        />
      )}
    </div>
  );
};

export default RevisionPlansPieChart;
