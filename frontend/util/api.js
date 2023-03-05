import axios from "axios";

const api = axios.create({
  baseURL: "http://ec2-43-201-71-58.ap-northeast-2.compute.amazonaws.com:3000",
});

export default api;
