import feathers from "@feathersjs/feathers";
import rest from "@feathersjs/rest-client";

const app = feathers();

const tokenjwt = localStorage.getItem("tokenjwt");

// Connect to a different URL
const restClient = rest(process.env.REACT_APP_IP_API);

// Configure an AJAX library (see below) with that client
app.configure(restClient.fetch(window.fetch, { headers: { token: tokenjwt } }));

export default app;
