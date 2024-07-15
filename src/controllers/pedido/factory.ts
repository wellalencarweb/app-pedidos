import { PedidoUseCaseFactory } from "useCases";
import { PedidoController } from "./controller";

export class PedidoControllerFactory {
    public static create(): PedidoController {
        const pedidoUseCase = PedidoUseCaseFactory.create();

        return new PedidoController(pedidoUseCase);
    }
}
