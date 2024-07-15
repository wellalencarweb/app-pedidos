import axios from "axios";
import { serverConfig } from "config";

export const clienteServiceApi = axios.create({
    baseURL: serverConfig.clienteService.url,
});

export type ClienteServiceApi = typeof clienteServiceApi;
