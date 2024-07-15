import { ApiPaths } from "./paths";

export const SwaggerConfig = {
    openapi: "3.0.0",
    info: {
        title: "fiap-5soat-tech-challenge",
        description:
            "Projeto do curso da pós tech Fiap Arquitetura de Software",
        version: "1.0.0",
    },
    servers: [
        {
            url: "/api",
        },
    ],
    tags: [
        {
            name: "pedido",
            description: "Rotas relacionadas a pedido",
        },
    ],
    paths: ApiPaths,
};
