/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DtoObservationPoint {
  date_created?: string;
  date_formed?: string;
  description?: string;
  id?: number;
  image_url?: string;
  latitude?: number;
  likes?: number;
  longitude?: number;
  name?: string;
  video_url?: string;
}

export interface DtoObservationPointFeed {
  date_created?: string;
  date_formed?: string;
  description?: string;
  id?: number;
  image_url?: string;
  latitude?: number;
  liked?: number;
  likes?: number;
  longitude?: number;
  name?: string;
  video_url?: string;
}

export interface DtoObservationPointList {
  date_created?: string;
  date_formed?: string;
  description?: string;
  id?: number;
  image_url?: string;
  is_mine?: number;
  latitude?: number;
  likes?: number;
  longitude?: number;
  name?: string;
  video_url?: string;
}

export interface DtoUser {
  id?: number;
  is_moderator?: boolean;
  login?: string;
}

export interface HandlerLikeRequest {
  value?: number;
}

export interface HandlerLoginRequest {
  login?: string;
  password?: string;
}

export interface HandlerLoginResponse {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface HandlerPublishRequest {
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface HandlerRegisterRequest {
  login?: string;
  password?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "//localhost:3001/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title ISS Visibility API
 * @version 1.0
 * @baseUrl //localhost:3001/api
 * @contact
 *
 * Сервис определения времени видимости МКС с Земли. Предметная услуга — точка наблюдения.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  observationPoints = {
    /**
     * @description Опубликованные услуги с фильтром по минимальной широте. Без токена или с недействительным токеном запрос выполняется как гостевой: is_mine всегда 0.
     *
     * @tags Точки наблюдения
     * @name ObservationPointsList
     * @summary Список точек наблюдения
     * @request GET:/observation_points
     * @response `200` `(DtoObservationPointList)[]` OK
     * @response `400` `void` Недопустимое значение широты
     * @response `500` `void` Internal Server Error
     */
    observationPointsList: (
      query?: {
        /** Минимальная широта, от -90 до 90 */
        min_latitude?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<DtoObservationPointList[], void>({
        path: `/observation_points`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Название и файлы. Файлы уходят в Minio, в базу попадают только ссылки. Описание задаётся при публикации.
     *
     * @tags Точки наблюдения
     * @name ObservationPointsCreate
     * @summary Создание черновика
     * @request POST:/observation_points
     * @secure
     * @response `201` `DtoObservationPoint` Created
     * @response `400` `void` Пустое название или недопустимый тип файла
     * @response `401` `void` Unauthorized
     * @response `409` `void` Черновик уже существует
     * @response `500` `void` Internal Server Error
     */
    observationPointsCreate: (
      data: {
        /** Название точки наблюдения */
        name: string;
        /**
         * Изображение
         * @format binary
         */
        image?: File;
        /**
         * Короткое видео
         * @format binary
         */
        video?: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<DtoObservationPoint, void>({
        path: `/observation_points`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Идентификатор не указывается: черновик у пользователя может быть только один.
     *
     * @tags Точки наблюдения
     * @name DraftList
     * @summary Черновик текущего пользователя
     * @request GET:/observation_points/draft
     * @secure
     * @response `200` `DtoObservationPoint` OK
     * @response `401` `void` Unauthorized
     * @response `404` `void` Черновика нет
     * @response `500` `void` Internal Server Error
     */
    draftList: (params: RequestParams = {}) =>
      this.request<DtoObservationPoint, void>({
        path: `/observation_points/draft`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Ровно одна услуга: без параметра — первая, с after — следующая за указанной. Когда следующей нет, лента замыкается на первую. Без токена или с недействительным токеном запрос выполняется как гостевой: liked всегда 0.
     *
     * @tags Точки наблюдения
     * @name FeedList
     * @summary Лента
     * @request GET:/observation_points/feed
     * @response `200` `DtoObservationPointFeed` OK
     * @response `400` `void` Недопустимый идентификатор
     * @response `404` `void` Опубликованных услуг нет
     * @response `500` `void` Internal Server Error
     */
    feedList: (
      query?: {
        /** Идентификатор предыдущей показанной услуги */
        after?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<DtoObservationPointFeed, void>({
        path: `/observation_points/feed`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Логическое удаление: запись остаётся в базе со статусом «удалена».
     *
     * @tags Точки наблюдения
     * @name ObservationPointsDelete
     * @summary Удаление услуги
     * @request DELETE:/observation_points/{id}
     * @secure
     * @response `204` `void` Услуга удалена
     * @response `400` `void` Недопустимый идентификатор
     * @response `401` `void` Unauthorized
     * @response `404` `void` Услуга не найдена или принадлежит другому пользователю
     * @response `500` `void` Internal Server Error
     */
    observationPointsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/observation_points/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Значение 1 ставит отметку текущего пользователя, 0 снимает. Повторный вызов с тем же значением ничего не меняет.
     *
     * @tags Точки наблюдения
     * @name LikeCreate
     * @summary Отметка «нравится»
     * @request POST:/observation_points/{id}/like
     * @secure
     * @response `200` `DtoObservationPoint` OK
     * @response `400` `void` Значение отличается от 0 и 1
     * @response `401` `void` Unauthorized
     * @response `404` `void` Услуга не найдена
     * @response `500` `void` Internal Server Error
     */
    likeCreate: (
      id: number,
      request: HandlerLikeRequest,
      params: RequestParams = {},
    ) =>
      this.request<DtoObservationPoint, void>({
        path: `/observation_points/${id}/like`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Переводит черновик в опубликованные вместе с описанием и координатами. Статус с клиента не принимается, операция необратима.
     *
     * @tags Точки наблюдения
     * @name PublishUpdate
     * @summary Публикация услуги
     * @request PUT:/observation_points/{id}/publish
     * @secure
     * @response `200` `DtoObservationPoint` OK
     * @response `400` `void` Пустое описание или координаты вне допустимых границ
     * @response `401` `void` Unauthorized
     * @response `404` `void` Черновик не найден или принадлежит другому пользователю
     * @response `500` `void` Internal Server Error
     */
    publishUpdate: (
      id: number,
      request: HandlerPublishRequest,
      params: RequestParams = {},
    ) =>
      this.request<DtoObservationPoint, void>({
        path: `/observation_points/${id}/publish`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
