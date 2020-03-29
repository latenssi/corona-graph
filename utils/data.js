import dateformat from "dateformat";

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
  return data.filter(d => d.date > "2020-02-22");
}

function predict(history, constants) {
  const actualSpreadrate =
    constants.spreadRate -
    (constants.spreadRate - 1) * constants.measuresEffectiveness;

  const incubatedCases =
    history[history.length - constants.incubationTime].confirmed ||
    history[history.length - constants.incubationTime].confirmed_pred ||
    0;

  const lastConfirmed =
    history[history.length - 1].confirmed ||
    history[history.length - 1].confirmed_pred ||
    0;

  return {
    confirmed_pred: Math.round(lastConfirmed * actualSpreadrate),
    recovered_pred: Math.round(incubatedCases * (1 - constants.deathRate)),
    deaths_pred: Math.round(incubatedCases * constants.deathRate)
  };
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

function addPredictionDates(origData, constants) {
  const data = origData.slice();

  const lastDate = new Date(data[data.length - 1].date);
  const firstFuture = lastDate.addDays(1);
  const lastFuture = lastDate.addDays(constants.predictedDays);

  getDatesBetween(firstFuture, lastFuture).forEach((date, i) => {
    const dateStr = dateformat(date, "yyyy-mm-dd");
    data.push({ date: dateStr, ...predict(data, constants) });
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
    addCumulPred(addPredictionDates(addCumul(addMissingDates(data)), constants))
  );
}

export { massageData };
