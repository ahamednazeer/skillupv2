import  Cookies  from 'js-cookie';
import axios from "axios";
import config from "../Config/Config";
import "react-toastify/dist/ReactToastify.css";


axios.defaults.timeout = 25000;
let setIsLoading: (isLoading: boolean) => void = () => {};
let setTimeOutModal: (isTimeOut: boolean) => void = () => {};

export const setLoaderCallback = (callback: (isLoading: boolean) => void) => {
  setIsLoading = callback;
};

export const setTimeoutModalCallback = (
  callback: (isTimeOut: boolean) => void
) => {
  setTimeOutModal = callback;
};

const api = axios.create({
  baseURL: config.BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("cctAccessToken");
    setIsLoading(true);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    setIsLoading(false);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  
  (response) => {
    setIsLoading(false);
    return response;
  },
  (error) => {
    setIsLoading(false);
    if (error.code === "ECONNABORTED") {
      setTimeOutModal(true);
    }
    return Promise.reject(error);
  }
);

export default api;
