import axios from "axios";

const api = axios.create({
  baseURL: "https://439b-97-118-184-53.ngrok.io:3000",
});

export default api;
