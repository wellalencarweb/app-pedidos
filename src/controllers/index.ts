import { PedidoControllerFactory } from "./pedido";
import { HealthControllerFactory } from "./health";

export const pedidoController = PedidoControllerFactory.create();
export const healthController = HealthControllerFactory.create();
