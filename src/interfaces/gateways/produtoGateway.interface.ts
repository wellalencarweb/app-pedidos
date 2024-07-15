import { Produto } from "entities/produto";

export interface ProdutoGateway {
    getByIds(ids: string[]): Promise<Produto[] | undefined>;
}
