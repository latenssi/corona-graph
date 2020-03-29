import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";

import { massageData, getPredictionBoundary } from "../utils/data";

import styles from "./Index.module.css";

const DATA_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/FI/grouped.json"
    : "https://corona-adapter.herokuapp.com/FI/grouped.json";

function Index() {
  const [data, setData] = React.useState([]);
  const [predictionBoundary, setPredictionBoundary] = React.useState("");

  const [constants, setConstants] = React.useState({
    predictedDays: 14,
    deathRate: 0.02,
    hospitalizationRate: 0.1,
    intensiveCareRate: 0.1 * 0.29,
    incubationTime: 20,
    spreadRate: 1.35,
    measuresEffectiveness: 0.7
  });

  React.useEffect(() => {
    fetch(DATA_URL)
      .then(r => r.json())
      .then(d => {
        setData(massageData(d, constants));
        setPredictionBoundary(getPredictionBoundary(d));
      });
  }, []);

  return (
    <div className={styles.main}>
      {data ? (
        <React.Fragment>
          <Chart data={data} predictionBoundary={predictionBoundary}>
            <Area
              type="monotone"
              dataKey="confirmed_cum"
              fill="#b6b0ff"
              stroke="#3f2eff"
              name="Kumul. varmistuneet"
            />
            <Bar dataKey="confirmed" fill="#3f2eff" name="Varmistuneet" />
          </Chart>
          <Chart data={data} predictionBoundary={predictionBoundary}>
            <Line
              type="monotone"
              dataKey="active"
              stroke="#ff8400"
              name="Aktiivisia (lask.)"
            />
            <Line
              type="monotone"
              dataKey="hospitalized"
              stroke="#df34eb"
              name="Sairaalahoidossa (lask.)"
            />
            <Line
              type="monotone"
              dataKey="icu"
              stroke="#eb3449"
              name="Tehohoidossa (lask.)"
            />
            <ReferenceLine
              y={600}
              stroke="red"
              label="Tehohoidon kapasiteetti"
            />
          </Chart>
          <Chart data={data} predictionBoundary={predictionBoundary}>
            <Area
              type="monotone"
              dataKey="recovered_cum"
              fill="#baffc3"
              stroke="#00c721"
              name="Kumul. parantuneet"
            />
            <Bar dataKey="recovered" fill="#00c721" name="Parantuneet" />
          </Chart>
          <Chart data={data} predictionBoundary={predictionBoundary}>
            <Area
              type="monotone"
              dataKey="deaths_cum"
              fill="#ff9c9c"
              stroke="#d40300"
              name="Kumul. kuolleet"
            />
            <Bar dataKey="deaths" fill="#d40300" name="Kuolleet" />
          </Chart>
        </React.Fragment>
      ) : null}
    </div>
  );
}

export default Index;

function Chart({ data, children, predictionBoundary }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
        syncId="grid-1"
      >
        <CartesianGrid opacity={0.5} />
        <XAxis dataKey="date" angle={-45} textAnchor="end" />
        <YAxis
          scale="log"
          domain={[1, dataMax => dataMax * 1.2]}
          allowDataOverflow
        />
        <Tooltip isAnimationActive={false} />
        <Legend verticalAlign="top" />
        {children}
        <ReferenceLine x={predictionBoundary} stroke="green" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
