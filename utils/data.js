import eachDayOfInterval from "date-fns/eachDayOfInterval";
import format from "date-fns/format";
import addDays from "date-fns/addDays";

import { adjNormDist } from "../utils/gaussian";

const cutOffDate = "2020-02-23";
const population = 5.513e6;

const predictedDays = 90;

const model3 = {
  peakDate: "2020-04-30",
  incubationTime: 20,
  deathRate: 0.02,
  hospitalisationRate: 0.1,
  intensiveCareRate: 0.1 * 0.29,
  maxConfirmed: 800,
  variance: 280 // For the curve - not really variance
};

const model4 = {
  peakDate: "2020-06-18",
  incubationTime: 20,
  deathRate: 0.01,
  hospitalisationRate: 0.1,
  intensiveCareRate: 0.1 * 0.29,
  maxConfirmed: 8000,
  totalInfected: 0.1 // of the population
};

export const activeModel = model4;

function formatDate(date) {
  return format(date, "yyyy-MM-dd");
}

function filterOldDates(data) {
  return data.filter(d => d.date >= cutOffDate);
}

function addMissingDates(origData) {
  const data = origData.slice(); // Make a copy

  eachDayOfInterval({
    start: new Date(data[0].date),
    end: new Date(data[data.length - 1].date)
  })
    .map(formatDate)
    .forEach((date, i) => {
      if (data[i] && data[i].date !== date) {
        data.splice(i, 0, { date });
      }
    });

  return data;
}

function addPredictedDates(origData) {
  if (predictedDays <= 0) return origData;

  const data = origData.slice(); // Make a copy

  const lastDate = new Date(data[data.length - 1].date);

  eachDayOfInterval({
    start: addDays(lastDate, 1),
    end: addDays(lastDate, predictedDays)
  })
    .map(formatDate)
    .forEach(date => {
      data.push({ date, prediction: true });
    });

  return data;
}

function addPredictedConfirmed(data) {
  // Make sure we get an index so the calculation work even when peakDate is not
  // in our data

  const mean = eachDayOfInterval({
    start: new Date(data[0].date),
    end: new Date(activeModel.peakDate)
  })
    .map(formatDate)
    .findIndex(date => date === activeModel.peakDate);

  const modelFunc = adjNormDist(
    mean,
    activeModel.totalInfected * population,
    activeModel.maxConfirmed
  );

  return data.map((d, i) => {
    const confirmed_model = modelFunc(i);
    return {
      ...d,
      confirmed: d.prediction ? Math.round(confirmed_model) : d.confirmed,
      confirmed_model
    };
  });
}

function addPredictedOther(data) {
  return data.map((d, i) => {
    if (!d.prediction) return d;

    const { confirmed: incubatedCases } = data[
      i - activeModel.incubationTime
    ] || {
      confirmed: 0
    };

    const deaths = d.prediction
      ? Math.round(incubatedCases * activeModel.deathRate)
      : d.deaths;

    const recovered = d.prediction ? incubatedCases - deaths : d.recovered;

    return {
      ...d,
      recovered,
      deaths
    };
  });
}

function addCumulative(data) {
  let confirmed_cum = 0;
  let recovered_cum = 0;
  let deaths_cum = 0;
  let active = 0;
  return data.map(d => {
    confirmed_cum += d["confirmed"] || 0;
    recovered_cum += d["recovered"] || 0;
    deaths_cum += d["deaths"] || 0;
    active = confirmed_cum - recovered_cum - deaths_cum;
    return {
      ...d,
      confirmed_cum,
      recovered_cum,
      deaths_cum,
      active
    };
  });
}

function addHospitalised(data) {
  return data.map(d => ({
    ...d,
    hospitalised: Math.round(d.active * activeModel.hospitalisationRate),
    icu: Math.round(d.active * activeModel.intensiveCareRate)
  }));
}

function massageData(data) {
  return {
    data: filterOldDates(
      addHospitalised(
        addCumulative(
          addPredictedOther(
            addPredictedConfirmed(addPredictedDates(addMissingDates(data)))
          )
        )
      )
    ),
    meta: { predictionBoundary: getPredictionBoundary(data) }
  };
}

function getPredictionBoundary(data) {
  return formatDate(new Date(data[data.length - 1].date));
}

export { massageData, getPredictionBoundary };
