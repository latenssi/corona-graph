require("es6-promise").polyfill();
require("isomorphic-fetch");

let fetching = false;

onmessage = function ({ data }) {
  if (data.uri) {
    if (!fetching) {
      fetching = true;
      fetch(data.uri)
        .then((response) => response.json())
        .then((data) => {
          fetching = false;
          postMessage({ result: data });
        })
        .catch(() => {
          fetching = false;
        });
    }
  }
};
