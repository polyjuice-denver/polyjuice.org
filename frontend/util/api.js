import axios from "axios";

const api = axios.create({
  baseURL: "http://43.201.71.58:3000",
});

export default api;
