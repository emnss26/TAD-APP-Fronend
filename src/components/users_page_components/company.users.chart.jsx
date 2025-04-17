import React, { useRef, useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';

const CompanyUsersChart = ({ companyCounts, onCompanyClick}) => {
  const chartContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(400); // Valor inicial predeterminado

  useEffect(() => {
      const resizeObserver = new ResizeObserver((entries) => {
          if (entries[0]) {
              setContainerWidth(entries[0].contentRect.width);
          }
      });

      if (chartContainerRef.current) {
          resizeObserver.observe(chartContainerRef.current);
      }

      return () => {
          if (chartContainerRef.current) {
              resizeObserver.unobserve(chartContainerRef.current);
          }
      };
  }, []);

  const data = Object.keys(companyCounts).map((company) => ({
      company,
      users: companyCounts[company],
  }));

  const maxUsers = Math.max(...Object.values(companyCounts), 0);

  const tickStep = maxUsers <= 20 ? 1 : 10; 
  const tickValues = Array.from(
      { length: Math.ceil(maxUsers / tickStep) + 1 },
      (_, i) => i * tickStep
  );

  return (
      <div ref={chartContainerRef} style={{ height: '100%', width: '100%' }}>
          <ResponsiveBar
              data={data}
              keys={['users']}
              indexBy="company"
              margin={{ top: 3, right: 3, bottom: 25, left: 150 }}
              padding={0.3}
              layout="horizontal"
              colors={['#2ea3e3']}
              borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                  tickSize: 4,
                  tickPadding: 5,
                  tickRotation: 0,
                  tickValues: tickValues,
                  legend: '',
              }}
              axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
              }}
              enableGridX={true}
              enableGridY={false}
              width={containerWidth} 
              height={350}
              tooltip={({ id, value }) => (
                  <div
                      style={{
                          padding: '5px 10px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          borderRadius: '1px',
                      }}
                  >
                      <strong>{id}</strong>: {value}
                  </div>
              )}
              onClick={(bar) => onCompanyClick(bar.indexValue)}
          />
      </div>
  );
};

export default CompanyUsersChart;