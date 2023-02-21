import axios from "axios";
import config from "./config";

const API = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

export default API;
