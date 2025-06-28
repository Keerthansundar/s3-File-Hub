import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL + "/api/auth";

export const register = (email, password) => {
  return axios.post(`${API_URL}/register`, { email, password });
};

export const login = (email, password) => {
  return axios.post(`${API_URL}/login`, { email, password });
};

export const verifyEmail = (email) => {
  return axios.get(`${API_URL}/verify`, { params: { email } });
};
