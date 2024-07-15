import { Cliente } from "entities/cliente";
import { ClienteDTO } from "external/clienteService";

import { Email, Cpf } from "valueObjects";

export class ClienteMapper {
    public static toDomain(dto: ClienteDTO): Cliente {
        return new Cliente({
            id: dto?.id,
            nome: dto.nome,
            email: Email.create(dto.email),
            cpf: Cpf.create(dto.cpf),
        });
    }
}
