import { Produto } from "entities/produto";
import { ProdutoDTO } from "external/produtoService";

export class ProdutoMapper {
    public static toDomain(dto: ProdutoDTO): Produto {
        return new Produto({
            id: dto.id,
            nome: dto.nome,
            preco: dto.preco,
            categoria: dto.categoria,
            descricao: dto.descricao,
            imagem: dto.imagem,
        });
    }
}
