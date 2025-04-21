import React from 'react';
import { ResponsivePie } from '@nivo/pie';

const RFIsPriorityChart = ({ data, onSliceClick }) => {
    const chartData = [
        {
        id: 'High',
        value: data.high,
        },
        {
        id: 'Normal',
        value: data.normal,
        },
        {
        id: 'Low',
        value: data.low,
        },
    ];
    
    return (
        <div style={{ height: '420px', width: '420px', margin: '1px auto' }}>
        <ResponsivePie
            data={chartData}
            innerRadius={0.65}
            padAngle={1}
            activeOuterRadiusOffset={4}
            margin={{ top: 10, right: 150, bottom: 40, left: 30 }}
            colors={['#0077b7', '#0c2c54ff', '#ababab']}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.6]] }}
            enableArcLinkLabels={false}
            arcLinkLabelsSkipAngle={10}
            arcLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#ffffff"
            legends={[
                {
                    anchor: 'right',
                    direction: 'column',
                    justify: false,
                    translateX: 100, 
                    translateY: 0,
                    itemsSpacing: 4,
                    itemWidth: 60,
                    itemHeight: 14,
                    itemTextColor: '#000',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 9,
                    symbolShape: 'circle',
                },
            ]}
            onClick={(slice) => onSliceClick(slice.id)}
        />
        </div>
    );
}

export default RFIsPriorityChart;