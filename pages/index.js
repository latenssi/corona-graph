import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

import { massageData } from "../utils/data";

import styles from "./Index.module.css";

const DATA_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/FI/grouped.json"
    : "https://corona-adapter.herokuapp.com/FI/grouped.json";

function Index() {
  const [data, setData] = React.useState([]);
  const [constants, setConstants] = React.useState({
    predictedDays: 14,
    deathRate: 0.02,
    incubationTime: 20,
    spreadRate: 1.35,
    measuresEffectiveness: 0.6
  });

  React.useEffect(() => {
    fetch(DATA_URL)
      .then(r => r.json())
      .then(d => setData(massageData(d, constants)));
  }, []);

  return (
    <div className={styles.main}>
      {data ? (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
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

            <Area
              type="monotone"
              dataKey="confirmed_cum"
              fill="#b6b0ff"
              stroke="#3f2eff"
              name="Kumul. varmistuneet"
            />
            <Area
              type="monotone"
              dataKey="recovered_cum"
              fill="#baffc3"
              stroke="#00c721"
              name="Kumul. parantuneet"
            />
            <Area
              type="monotone"
              dataKey="deaths_cum"
              fill="#ff9c9c"
              stroke="#d40300"
              name="Kumul. kuolleet"
            />

            <Bar
              dataKey="confirmed"
              barSize={20}
              fill="#3f2eff"
              name="Varmistuneet"
            />
            <Bar
              dataKey="recovered"
              barSize={20}
              fill="#00c721"
              name="Parantuneet"
            />
            <Bar dataKey="deaths" barSize={20} fill="#d40300" name="Kuolleet" />

            <Line
              type="monotone"
              dataKey="active"
              stroke="#ff8400"
              name="Aktiivisia"
            />

            <Area
              type="monotone"
              dataKey="confirmed_cum_pred"
              fill="#b6b0ff"
              stroke="#3f2eff"
              name="Kumul. varmistuneet (ennuste)"
            />
            <Area
              type="monotone"
              dataKey="recovered_cum_pred"
              fill="#baffc3"
              stroke="#00c721"
              name="Kumul. parantuneet (ennuste)"
            />
            <Area
              type="monotone"
              dataKey="deaths_cum_pred"
              fill="#ff9c9c"
              stroke="#d40300"
              name="Kumul. kuolleet (ennuste)"
            />

            <Bar
              dataKey="confirmed_pred"
              barSize={20}
              fill="#3f2eff"
              name="Varmistuneet (ennuste)"
            />
            <Bar
              dataKey="recovered_pred"
              barSize={20}
              fill="#00c721"
              name="Parantuneet (ennuste)"
            />
            <Bar
              dataKey="deaths_pred"
              barSize={20}
              fill="#d40300"
              name="Kuolleet (ennuste)"
            />

            <Line
              type="monotone"
              dataKey="active_pred"
              stroke="#ff8400"
              name="Aktiivisia (ennuste)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}

export default Index;
