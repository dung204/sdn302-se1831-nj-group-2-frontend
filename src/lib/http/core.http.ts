import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type CreateAxiosDefaults,
  HttpStatusCode,
  type InternalAxiosRequestConfig,
} from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';

import { localStorageService } from '@/common/services';
import { LocalStorageKey } from '@/common/types';
import { envVariables } from '@/common/utils';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  isPrivateRoute?: boolean;
}

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  isPrivateRoute?: boolean;
}

export class HttpClient {
  private readonly axiosInstance: AxiosInstance;

  constructor(
    baseURL: string = envVariables.API_ENDPOINT,
    { headers, ...otherAxiosConfig }: Omit<CreateAxiosDefaults, 'baseURL'> = {},
  ) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...otherAxiosConfig,
    });

    this.axiosInstance.interceptors.request.use(this.onSuccessRequest);

    this.axiosInstance.interceptors.response.use(
      this.onSuccessResponse,
      this.onFailedResponse,
    );
  }

  protected async onSuccessRequest({
    isPrivateRoute,
    ...config
  }: CustomInternalAxiosRequestConfig) {
    if (isPrivateRoute) {
      let accessToken: string;
      let refreshToken: string;

      try {
        accessToken = localStorageService.get(LocalStorageKey.ACCESS_TOKEN, '');

        const { exp } = jwtDecode(accessToken);
        if (exp! * 1000 < Date.now()) throw new Error();

        config.headers.Authorization = `Bearer ${accessToken}`;
      } catch (accessTokenError) {
        refreshToken = localStorageService.get(
          LocalStorageKey.REFRESH_TOKEN,
          '',
        );
        const result = (
          await axios.post(`${envVariables.BASE_URL}/auth/refresh-token`, {
            refreshToken,
          })
        ).data.data;

        localStorageService.set(
          LocalStorageKey.ACCESS_TOKEN,
          result.accessToken,
        );
        localStorageService.set(
          LocalStorageKey.REFRESH_TOKEN,
          result.refreshToken,
        );

        config.headers.Authorization = `Bearer ${result.accessToken}`;
      }
    }
    return config;
  }

  protected onSuccessResponse(response: AxiosResponse) {
    return response.data;
  }

  protected onFailedResponse(error: AxiosError) {
    if (!error.status || error.status === HttpStatusCode.InternalServerError) {
      toast.error('Unexpected error occurred!');
      return;
    }

    if (error.status === HttpStatusCode.Unauthorized) {
      if (window.location.pathname !== '/login') {
        localStorageService.remove(LocalStorageKey.ACCESS_TOKEN);
        localStorageService.remove(LocalStorageKey.REFRESH_TOKEN);
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }

  public get<T>(url: string, config?: CustomAxiosRequestConfig) {
    return this.axiosInstance.get<T, T>(url, config);
  }

  public post<T>(
    url: string,
    data?: unknown,
    config?: CustomAxiosRequestConfig,
  ) {
    return this.axiosInstance.post<T, T>(url, data, config);
  }

  public patch<T>(
    url: string,
    data?: unknown,
    config?: CustomAxiosRequestConfig,
  ) {
    return this.axiosInstance.patch<T, T>(url, data, config);
  }

  public put<T>(
    url: string,
    data?: unknown,
    config?: CustomAxiosRequestConfig,
  ) {
    return this.axiosInstance.put<T, T>(url, data, config);
  }

  public delete<T = void>(url: string, config?: CustomAxiosRequestConfig) {
    return this.axiosInstance.delete<T, T>(url, config);
  }
}

export const httpClient = new HttpClient();
