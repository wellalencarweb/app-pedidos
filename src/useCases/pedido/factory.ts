import {
    ClienteServiceGateway,
    PedidoMongoGateway,
    ProdutoServiceGateway,
} from "gateways";
import { PedidoUseCase } from "useCases";
import { PedidoModel } from "external/mongo/models";
import { clienteServiceApi } from "external/clienteService";
import { produtoServiceApi } from "external/produtoService";
import { serverConfig } from "config";
import { QueueManager } from "external/queueService";
import { SQSClient } from "external/queueService/client";

export class PedidoUseCaseFactory {
    public static create(): PedidoUseCase {
        const pedidoGateway = new PedidoMongoGateway(PedidoModel);
        const produtoGateway = new ProdutoServiceGateway(produtoServiceApi);
        const clienteGateway = new ClienteServiceGateway(clienteServiceApi);
        const notificaoQueueManager = new QueueManager(
            serverConfig.queues.notificaoCliente,
            SQSClient,
        );

        return new PedidoUseCase(
            PedidoModel,
            pedidoGateway,
            produtoGateway,
            clienteGateway,
            notificaoQueueManager,
        );
    }
}
