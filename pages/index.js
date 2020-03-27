import React from "react";
import dateformat from "dateformat";
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
              dataKey="recovered"
              barSize={20}
              fill="#00c721"
              name="Parantuneet"
            />
            <Bar
              dataKey="confirmed"
              barSize={20}
              fill="#3f2eff"
              name="Varmistuneet"
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
              dataKey="recovered_pred"
              barSize={20}
              fill="#00c721"
              name="Parantuneet (ennuste)"
            />
            <Bar
              dataKey="confirmed_pred"
              barSize={20}
              fill="#3f2eff"
              name="Varmistuneet (ennuste)"
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

Date.prototype.addDays = function(days) {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

function getDates(startDate, stopDate) {
  const dateArray = new Array();
  let currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(new Date(currentDate));
    currentDate = currentDate.addDays(1);
  }
  return dateArray;
}

function filterOldDates(data) {
  return data.filter(d => d.date > "2020-02-22");
}

function addDatesBetween(origData, start, end, constants) {
  const data = origData.slice();
  const allDates = getDates(start, end).map(d => dateformat(d, "yyyy-mm-dd"));
  allDates.forEach((ad, i) => {
    if (data[i] && data[i].date !== ad) {
      // Adding empty data (in between)
      data.splice(i, 0, { date: ad, confirmed: 0, recovered: 0, deaths: 0 });
    } else if (!data[i]) {
      // Predicting (in future)
      const actualSpreadrate =
        constants.spreadRate -
        (constants.spreadRate - 1) * constants.measuresEffectiveness;

      const incubatedCases =
        data[i - constants.incubationTime].confirmed ||
        data[i - constants.incubationTime].confirmed_pred;

      data.push({
        date: ad,
        confirmed_pred: Math.round(
          (data[i - 1].confirmed || data[i - 1].confirmed_pred) *
            actualSpreadrate
        ),
        recovered_pred: Math.round(incubatedCases * (1 - constants.deathRate)),
        deaths_pred: Math.round(incubatedCases * constants.deathRate)
      });
    }
  });
  return data;
}

function addMissingDates(data) {
  // Assume data is in order
  const firstDate = new Date(data[0].date);
  const lastDate = new Date(data[data.length - 1].date);
  return addDatesBetween(data, firstDate, lastDate);
}

function addPredictionDates(data, days = 0, constants) {
  const firstDate = new Date(data[0].date);
  const lastDate = new Date(data[data.length - 1].date);
  const future = lastDate.addDays(days);
  return addDatesBetween(data, firstDate, future, constants);
}

function addCumul(data) {
  let confirmed_cum = 0;
  let recovered_cum = 0;
  let deaths_cum = 0;
  let active = 0;
  return data.map(({ date, ...datums }) => {
    confirmed_cum += datums["confirmed"] || 0;
    recovered_cum += datums["recovered"] || 0;
    deaths_cum += datums["deaths"] || 0;
    active = confirmed_cum - recovered_cum - deaths_cum;
    return {
      date,
      ...datums,
      confirmed_cum,
      recovered_cum,
      deaths_cum,
      active
    };
  });
}

function addCumulPred(data) {
  let confirmed_cum_pred = 0;
  let recovered_cum_pred = 0;
  let deaths_cum_pred = 0;
  let active_pred = 0;
  return data.map(({ date, ...datums }) => {
    if (!("confirmed_pred" in datums)) {
      confirmed_cum_pred = datums["confirmed_cum"];
      recovered_cum_pred = datums["recovered_cum"];
      deaths_cum_pred = datums["deaths_cum"];
      active_pred = datums["active_cum"];
      return { date, ...datums };
    }
    confirmed_cum_pred += datums["confirmed_pred"] || 0;
    recovered_cum_pred += datums["recovered_pred"] || 0;
    deaths_cum_pred += datums["deaths_pred"] || 0;
    active_pred = confirmed_cum_pred - recovered_cum_pred - deaths_cum_pred;
    return {
      date,
      ...datums,
      confirmed_cum_pred,
      recovered_cum_pred,
      deaths_cum_pred,
      active_pred
    };
  });
}

function massageData(data, constants) {
  return filterOldDates(
    addCumulPred(
      addPredictionDates(
        addCumul(addMissingDates(data)),
        constants.predictedDays,
        constants
      )
    )
  );
}
