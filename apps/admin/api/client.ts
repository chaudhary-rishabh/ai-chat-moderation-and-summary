import axios from "axios";
import axiosRetry from "axios-retry";
import { getSession, signOut } from "next-auth/react";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: `${SERVER_URL}/api/admin`,
  headers: { "Content-Type": "application/json" },
});

axiosRetry(apiClient, { retries: 2, retryDelay: axiosRetry.exponentialDelay });

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if ((session as any)?.accessToken) {
    config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await signOut({ redirect: true, callbackUrl: "/login" });
    }
    return Promise.reject(error);
  },
);
