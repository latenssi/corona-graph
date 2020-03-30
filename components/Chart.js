import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Label,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";

export default function Chart({
  children,
  data,
  activeModel,
  predictionBoundary,
  yAxisScale = "log",
  yAxisDomain = [1, dataMax => dataMax * 1.2]
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
        syncId="grid-1"
      >
        <CartesianGrid opacity={0.5} />
        <XAxis dataKey="date" angle={-45} textAnchor="end" />
        <YAxis scale={yAxisScale} domain={yAxisDomain} allowDataOverflow />
        <Tooltip isAnimationActive={false} />
        <Legend verticalAlign="top" />
        <ReferenceLine x={predictionBoundary} stroke="#e7f5d0" strokeWidth={8}>
          <Label value="Ennuste" offset={10} position="insideTopLeft" />
        </ReferenceLine>
        <ReferenceLine
          x={activeModel.peakDate}
          stroke="#b0deff"
          strokeWidth={8}
        >
          <Label value="Taittuma" offset={10} position="insideTopRight" />
        </ReferenceLine>
        {children}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
