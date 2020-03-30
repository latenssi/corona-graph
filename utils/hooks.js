import React from "react";
import DataWorker from "./data.worker";
import FetchWorker from "./fetch.worker";

export function useWorker(WorkerModule, callback) {
  const workerRef = React.useRef();

  React.useEffect(() => {
    const worker = new WorkerModule();
    workerRef.current = worker;
    worker.onmessage = message => {
      if (message.data.result) {
        callback(message.data.result);
      }
    };
    return () => {
      worker.terminate();
    };
  }, [WorkerModule, callback]);

  return (...args) => {
    workerRef.current.postMessage(...args);
  };
}

export function useData(dataURI) {
  const [data, setData] = React.useState(null);
  const sendToWorker = useWorker(FetchWorker, setData);
  React.useEffect(() => {
    if (dataURI) sendToWorker({ uri: dataURI });
  }, [dataURI]);
  return data;
}

export function useMassagedData(dataURI) {
  const [state, setState] = React.useState({ data: [], meta: {} });
  const sendToWorker = useWorker(DataWorker, setState);
  const rawData = useData(dataURI);
  React.useEffect(() => {
    if (rawData) sendToWorker(rawData);
  }, [rawData]);
  return state;
}
