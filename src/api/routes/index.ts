import { Router } from "express";
import { makePedidoRouter } from "./pedidoRouter";
import { makeHealthRouter } from "./healthRouter";

export function makeServerRouter(): Router {
    const serverRouter = Router();

    serverRouter.use("/pedido", makePedidoRouter());
    serverRouter.use("/health", makeHealthRouter());

    return serverRouter;
}
