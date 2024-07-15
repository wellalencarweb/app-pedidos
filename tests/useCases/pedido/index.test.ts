import { SQS } from "aws-sdk";
import { Cliente } from "entities/cliente";
import { StatusPedidoEnum, Pedido, StatusPagamentoEnum } from "entities/pedido";
import { Produto, CategoriaEnum } from "entities/produto";
import { PedidoModel } from "external/mongo/models";
import { QueueManager } from "external/queueService";
import { SQSClient } from "external/queueService/client";
import {
    ClienteGateway,
    PedidoGateway,
    ProdutoGateway,
} from "interfaces/gateways";
import { ClientSession } from "mongoose";
import { PedidoDTO, PedidoUseCase } from "useCases";
import { BadError } from "utils/errors/badError";
import { ResourceNotFoundError } from "utils/errors/resourceNotFoundError";
import { ValidationError } from "utils/errors/validationError";
import { Email, Cpf } from "valueObjects";

jest.mock("aws-sdk", () => {
    return {
        SQS: jest.fn().mockImplementation(() => {
            return {
                sendMessage: jest.fn().mockReturnValue({
                    promise: jest.fn(),
                }),
            };
        }),
    };
});

const mockClienteDTO = {
    id: "ec238204-b1cb-4ce9-baa0-890b4ddfde36",
    nome: "John Doe",
    email: "john_doe@user.com.br",
    cpf: "111.111.111-11",
};

const mockCliente = new Cliente({
    id: mockClienteDTO.id,
    nome: mockClienteDTO.nome,
    email: Email.create(mockClienteDTO.email),
    cpf: Cpf.create(mockClienteDTO.cpf),
});

const LANCHE = new Produto({
    id: "123",
    nome: "Hamburguer",
    preco: 10,
    categoria: CategoriaEnum.Lanche,
    descricao: "Delicious hamburger",
    imagem: "hamburguer.jpg",
});

const SOBREMESA = new Produto({
    id: "321",
    nome: "Petit Gateau",
    preco: 19.9,
    categoria: CategoriaEnum.Sobremesa,
    descricao: "Delicious petit gateau",
    imagem: "petit-gateau.jpg",
});

const mockPedidoDTO1 = {
    id: "001",
    valorTotal: 10,
    clienteId: mockClienteDTO.id,
    clienteCpf: mockClienteDTO.cpf,
    clienteEmail: mockClienteDTO.email,
    clienteNome: mockClienteDTO.nome,
    status: StatusPedidoEnum.Recebido,
    pagamento: StatusPagamentoEnum.Pagamento_pendente,
    itens: [
        {
            produtoId: LANCHE.id,
            quantidade: 1,
        },
    ],
};

const mockPedidoDTO2: PedidoDTO = {
    id: "any_another_id",
    valorTotal: 29.9,
    status: StatusPedidoEnum.Em_preparacao,
    pagamento: StatusPagamentoEnum.Pagamento_aprovado,
    clienteId: mockClienteDTO.id,
    clienteCpf: mockClienteDTO.cpf,
    clienteEmail: mockClienteDTO.email,
    clienteNome: mockClienteDTO.nome,
    itens: [
        {
            produtoId: LANCHE.id,
            quantidade: 1,
        },
        {
            produtoId: SOBREMESA.id,
            quantidade: 1,
        },
    ],
};
const mockPedidoDTO3 = {
    id: "any_onemore_id",
    valorTotal: 29.9,
    status: StatusPedidoEnum.Finalizado,
    pagamento: StatusPagamentoEnum.Pagamento_aprovado,
    itens: [
        {
            produtoId: LANCHE.id,
            quantidade: 1,
        },
        {
            produtoId: SOBREMESA.id,
            quantidade: 1,
        },
    ],
};

describe("Given PedidoUseCases", () => {
    let gatewayStub: PedidoGateway;
    let produtoGatewayStub: Partial<ProdutoGateway>;
    let clienteGatewayStub: Partial<ClienteGateway>;
    let queueMock: QueueManager;
    let sut: PedidoUseCase;

    const mockPedidos = [
        new Pedido({
            id: mockPedidoDTO1.id,
            valorTotal: mockPedidoDTO1.valorTotal,
            status: mockPedidoDTO1.status,
            pagamento: mockPedidoDTO1.pagamento,
            itens: mockPedidoDTO1.itens,
            cliente: mockCliente,
        }),
        new Pedido({
            id: mockPedidoDTO2.id,
            valorTotal: mockPedidoDTO2.valorTotal,
            status: mockPedidoDTO2.status,
            pagamento: mockPedidoDTO2.pagamento,
            itens: mockPedidoDTO2.itens,
            cliente: mockCliente,
        }),
        new Pedido({
            id: mockPedidoDTO3.id,
            valorTotal: mockPedidoDTO3.valorTotal,
            status: mockPedidoDTO3.status,
            pagamento: mockPedidoDTO3.pagamento,
            itens: mockPedidoDTO3.itens,
        }),
    ];

    class PedidoGatewayStub implements PedidoGateway {
        getById(id: string): Promise<Pedido> {
            return new Promise((resolve) =>
                resolve(mockPedidos.find((p) => p.id === id)),
            );
        }
        getAllOrderedByStatus(): Promise<Pedido[]> {
            return new Promise((resolve) => resolve(mockPedidos));
        }
        getAll(): Promise<Pedido[]> {
            return new Promise((resolve) => resolve(mockPedidos));
        }
        checkout(pedido: Pedido): Promise<Pedido> {
            return new Promise((resolve) => resolve(mockPedidos[1]));
        }
        update(id: string, pedido: Partial<Pedido>): Promise<Pedido> {
            return new Promise((resolve) => resolve(mockPedidos[1]));
        }
        updateStatus(id: string, status: StatusPedidoEnum): Promise<Pedido> {
            return new Promise((resolve) => resolve(mockPedidos[1]));
        }
        deleteClienteData(id: string): Promise<void> {
            return new Promise((resolve) => resolve());
        }
        updateStatusPagamento(
            id: string,
            status: StatusPagamentoEnum,
        ): Promise<Pedido> {
            return new Promise((resolve) =>
                resolve(
                    new Pedido({
                        id: mockPedidoDTO1.id,
                        valorTotal: mockPedidoDTO1.valorTotal,
                        status: mockPedidoDTO1.status,
                        pagamento: status,
                        itens: mockPedidoDTO1.itens,
                        cliente: mockCliente,
                    }),
                ),
            );
        }
    }

    class ProdutoGatewayStub implements Partial<ProdutoGateway> {
        getByIds(ids: string[]): Promise<Produto[]> {
            return new Promise((resolve) => resolve([LANCHE, SOBREMESA]));
        }
    }

    class ClienteGatewayStub implements Partial<ClienteGateway> {
        getById(id: string): Promise<Cliente> {
            return new Promise((resolve) => resolve(mockCliente));
        }
    }

    beforeAll(() => {
        jest.spyOn(PedidoModel, "startSession").mockImplementation(() => {
            return Promise.resolve({
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn(),
            } as Partial<ClientSession> as ClientSession);
        });
        gatewayStub = new PedidoGatewayStub();
        produtoGatewayStub = new ProdutoGatewayStub();
        clienteGatewayStub = new ClienteGatewayStub();
        queueMock = new QueueManager("test", SQSClient);
        sut = new PedidoUseCase(
            PedidoModel,
            gatewayStub,
            produtoGatewayStub as ProdutoGateway,
            clienteGatewayStub as ClienteGateway,
            queueMock,
        );
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    describe("When getById is called", () => {
        it("should return found pedido", async () => {
            const result = jest.spyOn(gatewayStub, "getById");

            const pedido = await sut.getById(mockPedidoDTO1.id);
            expect(result).toHaveBeenCalled();
            expect(pedido).toEqual(mockPedidoDTO1);
        });
        it("should throw a ResourceNotFoundError if pedido is not found", async () => {
            const action = sut.getById("wrong-id");

            await expect(action).rejects.toThrowError(ResourceNotFoundError);
        });
    });

    describe("When getAll is called", () => {
        it("should call getAll on the gateway and return the pedidos", async () => {
            const getAll = jest.spyOn(gatewayStub, "getAll");

            const pedidos = await sut.getAll();
            expect(getAll).toHaveBeenCalled();
            expect(pedidos).toEqual([
                mockPedidoDTO1,
                mockPedidoDTO2,
                mockPedidoDTO3,
            ]);
        });
    });

    describe("When getAllOrderedByStatus is called", () => {
        it("should call getAllOrderedByStatus on the gateway and return the pedidos ordered by status", async () => {
            const getAllOrderedByStatus = jest.spyOn(
                gatewayStub,
                "getAllOrderedByStatus",
            );

            const pedidos = await sut.getAllOrderedByStatus();
            expect(getAllOrderedByStatus).toHaveBeenCalled();
            expect(pedidos).toEqual([
                mockPedidoDTO1,
                mockPedidoDTO2,
                mockPedidoDTO3,
            ]);
        });
    });

    describe("Given checkout", () => {
        describe("When checkout is called with valid payload", () => {
            it("should return the created pedido id", async () => {
                const create = jest.spyOn(gatewayStub, "checkout");

                const pedido = await sut.checkout({
                    itens: mockPedidoDTO2.itens,
                });
                expect(create).toHaveBeenCalled();
                expect(pedido).toEqual(mockPedidoDTO2);
            });
        });
        describe("When checkout is called with valid payload and a related cliente", () => {
            it("should return the created pedido id", async () => {
                const createPedido = jest.spyOn(gatewayStub, "checkout");
                const getClienteById = jest.spyOn(
                    clienteGatewayStub,
                    "getById",
                );

                const pedido = await sut.checkout({
                    clienteId: mockClienteDTO.id,
                    clienteCpf: mockClienteDTO.cpf,
                    clienteEmail: mockClienteDTO.email,
                    clienteNome: mockClienteDTO.nome,
                    itens: mockPedidoDTO2.itens,
                });

                expect(createPedido).toHaveBeenCalled();
                expect(getClienteById).toHaveBeenCalled();
                expect(pedido).toEqual(mockPedidoDTO2);
                expect(pedido.clienteId).toEqual(mockClienteDTO.id);
                expect(pedido.clienteCpf).toEqual(mockClienteDTO.cpf);
                expect(pedido.clienteEmail).toEqual(mockClienteDTO.email);
            });
        });
        describe("When checkout is called with a set status", () => {
            it("should throw a validationError", async () => {
                const create = jest.spyOn(gatewayStub, "checkout");

                const action = sut.checkout({
                    status: StatusPedidoEnum.Pronto,
                    itens: [
                        {
                            produtoId: LANCHE.id,
                            quantidade: 1,
                        },
                    ],
                });

                await expect(action).rejects.toThrowError(ValidationError);

                expect(create).toHaveBeenCalled();
            });
        });
        describe("When checkout is called with a set pagamento status", () => {
            it("should throw a validationError", async () => {
                const create = jest.spyOn(gatewayStub, "checkout");
                const action = sut.checkout({
                    pagamento: StatusPagamentoEnum.Pagamento_aprovado,
                    itens: [
                        {
                            produtoId: LANCHE.id,
                            quantidade: 1,
                        },
                    ],
                });
                await expect(action).rejects.toThrowError(ValidationError);

                expect(create).toHaveBeenCalled();
            });
        });
    });

    describe("When update is called", () => {
        it("should call update on the gateway and return the updated pedido", async () => {
            const updateSpy = jest.spyOn(gatewayStub, "update");
            const pedido = await sut.update("any_another_id", {
                valorTotal: 10,
            });
            expect(updateSpy).toHaveBeenCalled();
            expect(pedido).toEqual(mockPedidoDTO2);
        });

        it("should throw an error if the pedido does not exist", async () => {
            const getByIdSpy = jest
                .spyOn(gatewayStub, "getById")
                .mockResolvedValueOnce(null);

            const pedido = sut.update("nonexistent-id", {
                valorTotal: 10,
            });

            await expect(pedido).rejects.toThrowError(
                new Error("Pedido não encontrado"),
            );
            expect(getByIdSpy).toHaveBeenCalledWith("nonexistent-id");
        });

        it("should throw an error if has attempt to update status", async () => {
            const pedido = sut.update("any_another_id", {
                status: StatusPedidoEnum.Em_preparacao,
            });

            await expect(pedido).rejects.toThrowError(
                new Error("Não é possível alterar o status por essa rota"),
            );
        });

        it("should throw an error if has attempt to update payment status", async () => {
            const pedido = sut.update("any_another_id", {
                pagamento: StatusPagamentoEnum.Pagamento_aprovado,
            });

            await expect(pedido).rejects.toThrowError(
                new Error(
                    "Não é possível alterar o status de pagamento por essa rota",
                ),
            );
        });
    });

    describe("When updateStatus is called", () => {
        it("should call updateStatus on the gateway and return the updated pedido", async () => {
            const updateStatusSpy = jest.spyOn(gatewayStub, "updateStatus");
            const pedido = await sut.updateStatus(
                "any_another_id",
                StatusPedidoEnum.Pronto,
            );
            expect(updateStatusSpy).toHaveBeenCalledWith(
                "any_another_id",
                StatusPedidoEnum.Pronto,
            );
            expect(pedido).toEqual(mockPedidoDTO2);
        });

        it("should throw an error if the pedido does not exist", async () => {
            const getByIdSpy = jest
                .spyOn(gatewayStub, "getById")
                .mockResolvedValueOnce(null);

            const pedido = sut.updateStatus(
                "nonexistent-id",
                StatusPedidoEnum.Em_preparacao,
            );

            await expect(pedido).rejects.toThrowError(
                new Error("Pedido não encontrado"),
            );
            expect(getByIdSpy).toHaveBeenCalledWith("nonexistent-id");
        });

        it("should throw an error if the request body does not contain status", async () => {
            const pedido = sut.updateStatus("any_another_id", undefined);

            await expect(pedido).rejects.toThrowError(
                new Error("É necessário informar o status"),
            );
        });

        it("should throw an error if the order is already 'finalizado'", async () => {
            const pedido = sut.updateStatus(
                "any_onemore_id",
                StatusPedidoEnum.Finalizado,
            );

            await expect(pedido).rejects.toThrowError(
                new Error(
                    "Não é possível alterar o status pois o pedido já está finalizado!",
                ),
            );
        });

        it("should throw an error if the request body does not contain a valid status", async () => {
            const pedido = sut.updateStatus(
                "any_another_id",
                "invalid_status" as any,
            );

            await expect(pedido).rejects.toThrowError(
                new Error("É necessário informar um status válido"),
            );
        });

        it("should throw an error if the order's payment is not authorized yet", async () => {
            const pedido = sut.updateStatus(
                "001",
                StatusPedidoEnum.Em_preparacao,
            );

            await expect(pedido).rejects.toThrowError(
                new Error(
                    "Não é possível alterar o status pois o pagamento ainda não foi aprovado!",
                ),
            );
        });

        it("should throw an error if the status is before current status", async () => {
            const pedido = sut.updateStatus(
                "any_another_id",
                StatusPedidoEnum.Recebido,
            );

            await expect(pedido).rejects.toThrowError(
                new Error(
                    "Status inválido, o próximo status válido para esse pedido é: pronto",
                ),
            );
        });

        it("should throw an error if the status is after expected status", async () => {
            const pedido = sut.updateStatus(
                "any_another_id",
                StatusPedidoEnum.Finalizado,
            );

            await expect(pedido).rejects.toThrowError(
                new Error(
                    "Status inválido, o próximo status válido para esse pedido é: pronto",
                ),
            );
        });
    });

    describe("When updatePaymentStatus is called", () => {
        it("should return pedido Em_preparacao for Pagamento_aprovado case", async () => {
            const id = "001";
            const newStatus = StatusPagamentoEnum.Pagamento_aprovado;

            const pedido = await sut.updatePaymentStatus(id, newStatus);

            expect(pedido.status).toEqual(StatusPedidoEnum.Em_preparacao);
            expect(pedido.pagamento).toEqual(newStatus);
        });
        it("should throw a ResourceNotFoundError if pedido is not found", async () => {
            const id = "wrong-id";
            const newStatus = StatusPagamentoEnum.Pagamento_aprovado;

            const action = sut.updatePaymentStatus(id, newStatus);

            await expect(action).rejects.toThrowError(ResourceNotFoundError);
        });
        it("should throw a ValidationError if input status is invalid", async () => {
            const id = "001";
            const newStatus = "status_invalido" as any;

            const action = sut.updatePaymentStatus(id, newStatus);

            await expect(action).rejects.toThrowError(ValidationError);
        });
        it("should throw a ValidationError if status is not present", async () => {
            const id = "001";
            const newStatus = undefined as any;

            const action = sut.updatePaymentStatus(id, newStatus);

            await expect(action).rejects.toThrowError(ValidationError);
        });
        it("should throw a BadError if pagamento was already processed", async () => {
            jest.spyOn(gatewayStub, "getById").mockResolvedValueOnce(
                new Pedido({
                    id: mockPedidoDTO1.id,
                    valorTotal: mockPedidoDTO1.valorTotal,
                    status: mockPedidoDTO1.status,
                    pagamento: StatusPagamentoEnum.Pagamento_aprovado,
                    itens: mockPedidoDTO1.itens,
                    cliente: mockCliente,
                }),
            );

            const id = "001";
            const newStatus = StatusPagamentoEnum.Pagamento_nao_autorizado;

            const action = sut.updatePaymentStatus(id, newStatus);

            await expect(action).rejects.toThrowError(BadError);
        });
    });

    describe("When deleteClienteData is called", () => {
        it("should call deleteClienteData on the gateway", async () => {
            const deleteClienteDataSpy = jest.spyOn(
                gatewayStub,
                "deleteClienteData",
            );
            await sut.deleteClienteData("any_another_id");
            expect(deleteClienteDataSpy).toHaveBeenCalledWith("any_another_id");
        });
    });
});
