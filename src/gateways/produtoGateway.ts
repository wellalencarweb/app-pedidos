import { ProdutoMapper } from "adapters/mappers";
import { Produto } from "entities/produto";
import { ProdutoDTO, ProdutoServiceApi } from "external/produtoService";
import { ProdutoGateway } from "interfaces/gateways";

export class ProdutoServiceGateway implements ProdutoGateway {
    constructor(private readonly produtoService: ProdutoServiceApi) {}

    async getByIds(ids: string[]): Promise<Produto[] | undefined> {
        const response = await this.produtoService.get<ProdutoDTO[]>("/", {
            params: {
                ids: ids.join(";"),
            },
        });
        const produtos = response.data;

        return produtos.map((result) => ProdutoMapper.toDomain(result));
    }
}
