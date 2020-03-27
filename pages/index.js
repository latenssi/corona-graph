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

import dateformat from "dateformat";

import styles from "./Index.module.css";

function Index() {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    fetch("https://corona-adapter.herokuapp.com/FI/grouped.json")
      .then(r => r.json())
      .then(d => setData(massageData(d)));
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
              stroke="#6e61ff"
              name="Kumul. varmistuneet"
            />
            <Area
              type="monotone"
              dataKey="recovered_cum"
              fill="#7dff8e"
              stroke="#00c721"
              name="Kumul. parantuneet"
            />
            <Area
              type="monotone"
              dataKey="deaths_cum"
              fill="#ff9c9c"
              stroke="#ff6161"
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

function addMissingDates(data) {
  // Assume data is in order
  const firstDate = data[0].date;
  const lastDate = data[data.length - 1].date;
  const allDates = getDates(new Date(firstDate), new Date(lastDate)).map(d =>
    dateformat(d, "yyyy-mm-dd")
  );
  allDates.forEach((ad, i) => {
    if (data[i] && data[i].date !== ad) {
      data.splice(i, 0, { date: ad, confirmed: 0, recovered: 0, deaths: 0 });
    }
  });
  return data;
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

function massageData(data) {
  return filterOldDates(addCumul(addMissingDates(data)));
}
