import express from "express";
import helmet from "helmet";
import nocache from "nocache";
import { serve, setup } from "swagger-ui-express";
import { createMongoConnection } from "external/mongo";
import { errorHandler } from "./middlewares";
import { makeServerRouter } from "./routes";
import { requestLogger } from "../utils/requestLogger";
import { SwaggerConfig } from "./docs";
import { confirmacaoPagamentoConsumer } from "external/queueService";
import { serverConfig } from "config";
import { anonimizacaoClienteConsumer } from "external/queueService/consumers/anonimizacaoClienteConsumer";


require("dotenv").config();

function buildServer() {
    createMongoConnection();

    const server = express();

    server.disable("x-powered-by");
    server.use(helmet());
    server.use(nocache());

    if (serverConfig.isProduction) {
        server.use(
            helmet.hsts({
                maxAge: 31536000,
                includeSubDomains: true,
            }),
        );
    }

    server.use(requestLogger);

    server.use(express.json({ limit: "10mb" }));
    server.use(express.urlencoded({ extended: true, limit: "10mb" }));

    server.use("/api-docs", serve, setup(SwaggerConfig));
    server.use("/api", makeServerRouter());
    server.use(errorHandler);

    console.log("Starting queue listeners");
    confirmacaoPagamentoConsumer.start();
    anonimizacaoClienteConsumer.start();

    return server;
}

export const server = buildServer();
