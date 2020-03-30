import dateformat from "dateformat";
import { gaussianPDF } from "../utils/gaussian";

const cutOffDate = "2020-02-23";

const predictedDays = 40;

const model1 = {
  peakDate: "2020-04-30",
  incubationTime: 20,
  deathRate: 0.02,
  hospitalisationRate: 0.1,
  intensiveCareRate: 0.1 * 0.29,
  variance: 350, // Gaussian
  scale: 20000 // Gaussian
};

const model2 = {
  peakDate: "2020-04-30",
  incubationTime: 20,
  deathRate: 0.02,
  hospitalisationRate: 0.1,
  intensiveCareRate: 0.1 * 0.29,
  variance: 280, // Gaussian
  scale: 30000 // Gaussian
};

const model3 = {
  peakDate: "2020-04-30",
  incubationTime: 20,
  deathRate: 0.02,
  hospitalisationRate: 0.1,
  intensiveCareRate: 0.1 * 0.29,
  maxConfirmed: 800,
  variance: 280 // For the curve - not really variance
};

export const activeModel = model3;

Date.prototype.addDays = function(days) {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

function getDatesBetween(startDate, stopDate) {
  const dateArray = new Array();
  let currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(new Date(currentDate));
    currentDate = currentDate.addDays(1);
  }
  return dateArray;
}

function filterOldDates(data) {
  return data.filter(d => d.date >= cutOffDate);
}

function addMissingDates(origData) {
  const data = origData.slice();

  const firstDate = new Date(data[0].date);
  const lastDate = new Date(data[data.length - 1].date);

  getDatesBetween(firstDate, lastDate).forEach((date, i) => {
    const dateStr = dateformat(date, "yyyy-mm-dd");
    if (data[i] && data[i].date !== dateStr) {
      data.splice(i, 0, { date: dateStr });
    }
  });

  return data;
}

function addPredictedDates(origData) {
  const data = origData.slice();

  const lastDate = new Date(data[data.length - 1].date);
  const firstFuture = lastDate.addDays(1);
  const lastFuture = lastDate.addDays(predictedDays);

  getDatesBetween(firstFuture, lastFuture).forEach((date, i) => {
    data.push({ date: dateformat(date, "yyyy-mm-dd"), prediction: true });
  });

  return data;
}

function addPredictedConfirmed(data) {
  const mean = data.findIndex(d => d.date === activeModel.peakDate);

  return data.map((d, i) => {
    const confirmed_gaus = Math.round(
      gaussianPDF(mean, activeModel.variance, i, activeModel.maxConfirmed)
    );
    return {
      ...d,
      confirmed: d.prediction ? confirmed_gaus : d.confirmed,
      confirmed_gaus
    };
  });
}

function addPredictedOther(data) {
  return data.map((d, i) => {
    const { confirmed: incubatedCases } = data[
      i - activeModel.incubationTime
    ] || {
      confirmed: 0
    };

    const recovered = d.prediction
      ? Math.round(incubatedCases * (1 - activeModel.deathRate))
      : d.recovered;

    const deaths = d.prediction
      ? Math.round(incubatedCases * activeModel.deathRate)
      : d.deaths;

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
  return dateformat(new Date(data[data.length - 1].date), "yyyy-mm-dd");
}

export { massageData, getPredictionBoundary };
