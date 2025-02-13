import axios, { AxiosRequestConfig } from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

type Method = "GET" | "POST" | "PUT" | "DELETE";

type ApiRequestOptions = AxiosRequestConfig & {
  /**
   * @default 'GET'
   */
  method: Method;
};

export type ApiRequestObject = {
  [key: string]: (params: any) => Promise<any>;
};

export const createService = <T extends ApiRequestObject>(requests: T): T => {
  for (const key in requests) {
    if (typeof requests[key] !== "function") {
      throw new Error(`${key} must be a function`);
    }

    const request = requests[key];
    if (request.length !== 1) {
      throw new Error(`${key} must take exactly one argument`);
    }
  }

  return requests;
};

export async function apiRequest<T>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      url: endpoint,
      method: options?.method || "GET",
      ...options,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "API Error");
  }
}
