import { massageData } from "../utils/data";

onmessage = function ({ data }) {
  const { rawData, ...options } = data;

  if (rawData) this.rawData = rawData;

  if (this.rawData) {
    postMessage({ result: massageData(this.rawData, options || {}) });
  }
};
