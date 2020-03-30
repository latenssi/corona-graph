import { massageData } from "../utils/data";

onmessage = function({ data }) {
  if (data) postMessage({ result: massageData(data) });
};
