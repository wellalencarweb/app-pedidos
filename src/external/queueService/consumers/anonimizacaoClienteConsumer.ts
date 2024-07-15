import { serverConfig } from "config";
import { PedidoUseCaseFactory } from "useCases/pedido/factory";
import { BadError } from "utils/errors/badError";
import { QueueConsumerFactory } from "../helpers/queueConsumerFactory";

export const anonimizacaoClienteConsumer = QueueConsumerFactory.create({
    name: "anonimizacaoCliente",
    queueUrl: serverConfig.queues.anonimizacaoCliente,
    handler: async (message) => {
        const pedidoUseCase = PedidoUseCaseFactory.create();

        try {
            const parsedBody = (await JSON.parse(message.Body)) as {
                clienteId: string;
            };

            await pedidoUseCase.deleteClienteData(parsedBody.clienteId);

            return message;
        } catch (error) {
            console.log(error);
            throw new BadError(error);
        }
    },
});
