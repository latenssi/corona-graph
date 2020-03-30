import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Label,
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

import { activeModel } from "../utils/data";
import { useMassagedData } from "../utils/hooks";

import styles from "./Index.module.css";

const DATA_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/FI/grouped.json"
    : "https://corona-adapter.herokuapp.com/FI/grouped.json";

function Index() {
  const [loading, setLoading] = React.useState(true);
  const dataState = useMassagedData(DATA_URL);

  React.useEffect(() => {
    if (dataState.data && dataState.data.length) setLoading(false);
  }, [dataState.data]);

  const {
    data,
    meta: { predictionBoundary = "" }
  } = dataState;

  if (loading)
    return (
      <div className={styles.loading}>
        <div className={styles["lds-ripple"]}>
          <div></div>
          <div></div>
        </div>
      </div>
    );

  return (
    <div className={styles.main}>
      {data ? (
        <React.Fragment>
          <Chart data={data} predictionBoundary={predictionBoundary}>
            {/* <Line
              type="monotone"
              dataKey="confirmed_gaus"
              stroke="#0094cf"
              name="Uusia tapauksia (gaussian)"
              strokeWidth={2}
              dot={false}
            /> */}
            <Area
              type="monotone"
              dataKey="confirmed_cum"
              fill="#b6b0ff"
              stroke="#3f2eff"
              name="Kumul. tapauksia"
            />
            <Bar dataKey="confirmed" fill="#3f2eff" name="Uusia tapauksia" />
          </Chart>
          <Chart data={data} predictionBoundary={predictionBoundary}>
            <ReferenceLine y={600} stroke="#ff8080" strokeWidth={4}>
              <Label
                value="Tehohoidon kapasiteetti"
                offset={8}
                position="insideTopLeft"
              />
            </ReferenceLine>
            <Area
              type="monotone"
              dataKey="active"
              stroke="#ff8400"
              fill="#ffead4"
              name="Aktiivisia"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="hospitalised"
              stroke="#df34eb"
              fill="#e4cae6"
              name="Sairaalahoidossa"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="icu"
              stroke="#eb3449"
              fill="#e8a9b1"
              name="Tehohoidossa"
              dot={false}
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

function Chart({
  data,
  children,
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
