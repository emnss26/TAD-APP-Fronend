import { ResponsivePie } from "@nivo/pie";

export default function DonutChartGeneric({ counts = {}, onSliceClick }) {
  const chartData = Object.entries(counts).map(([k, v]) => ({
    id: k,
    value: v,
  }));

  return (
    <div style={{ height: 500, width: 400, margin: "1px auto" }}>
      <ResponsivePie
        data={chartData}
        innerRadius={0.65}
        padAngle={1}
        activeOuterRadiusOffset={4}
        margin={{ top: 10, right: 150, bottom: 10, left: 30 }}
        colors={["#00BCFF", "#0077b7", "#0c2c54", "#4eb3d3", "#6b7474"]}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
        enableArcLinkLabels={false}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#ffffff"
        legends={[
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
        ]}
        onClick={(slice) => onSliceClick(slice.id)}
      />
    </div>
  );
}
