import { serverConfig } from "config";
import { PedidoUseCaseFactory } from "useCases/pedido/factory";
import { BadError } from "utils/errors/badError";
import { QueueConsumerFactory } from "../helpers/queueConsumerFactory";

export const confirmacaoPagamentoConsumer = QueueConsumerFactory.create({
    name: "confirmacaoPagemento",
    queueUrl: serverConfig.queues.confirmacaoPagemento,
    handler: async (message) => {
        const pedidoUseCase = PedidoUseCaseFactory.create();

        try {
            const parsedBody = (await JSON.parse(message.Body)) as {
                pedidoId: string;
                tipo: any;
            };

            await pedidoUseCase.updatePaymentStatus(
                parsedBody.pedidoId,
                parsedBody.tipo,
            );

            return message;
        } catch (error) {
            console.log(error);
            throw new BadError(error);
        }
    },
});
