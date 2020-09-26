import React from "react";
import { Area, Bar } from "recharts";

import Loading from "../components/Loading";
import Chart from "../components/Chart";

import { useMassagedData } from "../utils/hooks";

import styles from "./Index.module.css";

const DATA_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/FI/grouped.json"
    : "https://corona-adapter.herokuapp.com/FI/grouped.json";

function Index() {
  const [loading, setLoading] = React.useState(true);

  const { data } = useMassagedData(DATA_URL);

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
      <div className={styles.content}>
        {data ? (
          <Chart data={data}>
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
        ) : null}
      </div>
    </div>
  );
}

export default Index;
