import axios from 'axios';
import { API_HOST } from "@env";


const axiosInstance = axios.create({
  baseURL: API_HOST,
  timeout: 5000, // Set timeout to 5 seconds
});


export const loginUser = async (email, password) => {
  const response = await axiosInstance.post('/login', { email, password });
  return response.data;
};


// const BASE_URL = `${API_HOST}`;

// export const loginUser = async (email, password) => {
//   const response = await axios.post(`${API_HOST}/login`, { email, password });
//   return response.data;
// };