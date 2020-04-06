import React from "react";
import { Label, Line, Area, Bar, ReferenceLine } from "recharts";
import { Switch } from "@material-ui/core";

import Loading from "../components/Loading";
import Chart from "../components/Chart";
import Sidebar from "../components/Sidebar";

import { activeModel } from "../utils/data";
import { useMassagedData, useLocalStorage } from "../utils/hooks";

import styles from "./Index.module.css";

const DATA_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/FI/grouped.json"
    : "https://corona-adapter.herokuapp.com/FI/grouped.json";

function Index() {
  const [loading, setLoading] = React.useState(true);
  const [usePrediction, setUsePrediction] = useLocalStorage(
    "corona-graph:usePrediction",
    false
  );

  const {
    data,
    meta: { predictionBoundary },
  } = useMassagedData(DATA_URL, { usePrediction });

  React.useEffect(() => {
    if (data.length) setLoading(false);
  }, [data]);

  if (loading)
    return (
      <div className={styles.loading}>
        <Loading />
      </div>
    );

  return (
    <div className={styles.main}>
      <Sidebar>
        <div>
          Ennuste:
          <Switch
            checked={usePrediction}
            onChange={(e) => setUsePrediction(e.target.checked)}
          />
        </div>
      </Sidebar>
      <div className={styles.content}>
        {data ? (
          <React.Fragment>
            <Chart
              data={data}
              options={{ usePrediction, predictionBoundary, activeModel }}
            >
              <Line
                isAnimationActive={false}
                type="monotone"
                dataKey="confirmed_model"
                stroke="#0094cf"
                name="Uusia tapauksia (malli)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                isAnimationActive={false}
                type="monotone"
                dataKey="confirmed_cum"
                fill="#b6b0ff"
                stroke="#3f2eff"
                name="Kumul. tapauksia"
              />
              <Bar
                isAnimationActive={false}
                dataKey="confirmed"
                fill="#3f2eff"
                name="Uusia tapauksia"
              />
            </Chart>
            <Chart
              data={data}
              options={{ usePrediction, predictionBoundary, activeModel }}
            >
              <ReferenceLine y={600} stroke="#ff8080" strokeWidth={4}>
                <Label
                  value="Tehohoidon kapasiteetti"
                  offset={8}
                  position="insideTopLeft"
                />
              </ReferenceLine>
              <Area
                isAnimationActive={false}
                type="monotone"
                dataKey="active"
                stroke="#ff8400"
                fill="#ffead4"
                name="Aktiivisia"
                dot={false}
              />
              <Area
                isAnimationActive={false}
                type="monotone"
                dataKey="hospitalised"
                stroke="#df34eb"
                fill="#e4cae6"
                name="Sairaalahoidossa"
                dot={false}
              />
              <Area
                isAnimationActive={false}
                type="monotone"
                dataKey="icu"
                stroke="#eb3449"
                fill="#e8a9b1"
                name="Tehohoidossa"
                dot={false}
              />
            </Chart>
            <Chart
              data={data}
              options={{ usePrediction, predictionBoundary, activeModel }}
            >
              <Area
                isAnimationActive={false}
                type="monotone"
                dataKey="recovered_cum"
                fill="#baffc3"
                stroke="#00c721"
                name="Kumul. parantuneet"
              />
              <Bar
                isAnimationActive={false}
                dataKey="recovered"
                fill="#00c721"
                name="Parantuneet"
              />
            </Chart>
            <Chart
              data={data}
              options={{ usePrediction, predictionBoundary, activeModel }}
            >
              <Area
                isAnimationActive={false}
                type="monotone"
                dataKey="deaths_cum"
                fill="#ff9c9c"
                stroke="#d40300"
                name="Kumul. kuolleet"
              />
              <Bar
                isAnimationActive={false}
                dataKey="deaths"
                fill="#d40300"
                name="Kuolleet"
              />
            </Chart>
          </React.Fragment>
        ) : null}
      </div>
    </div>
  );
}

export default Index;
