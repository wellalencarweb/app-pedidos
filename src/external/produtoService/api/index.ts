import axios from "axios";
import { serverConfig } from "config";

export const produtoServiceApi = axios.create({
    baseURL: serverConfig.produtoService.url,
});

export type ProdutoServiceApi = typeof produtoServiceApi;
