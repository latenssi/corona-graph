require("es6-promise").polyfill();
require("isomorphic-fetch");

onmessage = function({ data }) {
  if (data.uri) {
    fetch(data.uri)
      .then(response => response.json())
      .then(data => postMessage({ result: data }));
  }
};
