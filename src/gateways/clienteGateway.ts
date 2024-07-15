import { Cliente } from "entities/cliente";
import { ClienteGateway } from "interfaces/gateways";
import { ClienteMapper } from "adapters/mappers";
import { ClienteDTO, ClienteServiceApi } from "external/clienteService";

export class ClienteServiceGateway implements ClienteGateway {
    constructor(private readonly clienteService: ClienteServiceApi) {}

    public async getById(id: string): Promise<Cliente | undefined> {
        const response = await this.clienteService.get<ClienteDTO>(`/${id}`);
        const cliente = response.data;

        return ClienteMapper.toDomain(cliente);
    }
}
