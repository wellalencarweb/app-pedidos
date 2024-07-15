import { StatusPagamentoEnum, StatusPedidoEnum } from "entities/pedido";

export const PagamentoToStatusMap: Record<
    StatusPagamentoEnum,
    StatusPedidoEnum
> = {
    [StatusPagamentoEnum.Pagamento_aprovado]: StatusPedidoEnum.Em_preparacao,
    [StatusPagamentoEnum.Pagamento_nao_autorizado]: StatusPedidoEnum.Cancelado,
    [StatusPagamentoEnum.Pagamento_pendente]: StatusPedidoEnum.Recebido,
};
