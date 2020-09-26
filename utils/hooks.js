import React from "react";
import DataWorker from "./data.worker";
import FetchWorker from "./fetch.worker";

export function useWorker(WorkerModule, callback) {
  const workerRef = React.useRef();

  React.useEffect(() => {
    const worker = new WorkerModule();
    workerRef.current = worker;
    worker.onmessage = (message) => {
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
    sendToWorker({ uri: dataURI });
  }, [dataURI]);
  return data;
}

export function useMassagedData(dataURI, options = { usePrediction: false }) {
  const { usePrediction } = options;
  const [state, setState] = React.useState({ data: [], meta: {} });
  const rawData = useData(dataURI);
  const sendToWorker = useWorker(DataWorker, setState);
  React.useEffect(() => {
    sendToWorker({ rawData, usePrediction });
  }, [rawData, usePrediction]);
  return state;
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {}
  };

  return [storedValue, setValue];
}
