import { Cliente } from "entities/cliente";

export interface ClienteGateway {
    getById(id: string): Promise<Cliente | undefined>;
}
