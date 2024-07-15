import { ProdutoMapper } from "adapters/mappers";
import { ProdutoDTO } from "external/produtoService";

describe("Given ProdutoMapper", () => {
    const ProdutoDTOMock: ProdutoDTO = {
        id: "1",
        nome: "lanche-1",
        preco: 10,
        categoria: "lanche",
        descricao: "lanche-descricao",
        imagem: "https://www.google.com/",
    };

    describe("When toDomain is called", () => {
        it("should parse a produto DTO to Domain format", async () => {
            const parsed = ProdutoMapper.toDomain({
                id: "1",
                nome: "lanche-1",
                preco: 10,
                categoria: "lanche",
                descricao: "lanche-descricao",
                imagem: "https://www.google.com/",
            });

            expect(parsed.nome).toEqual(ProdutoDTOMock.nome);
            expect(parsed.preco).toEqual(ProdutoDTOMock.preco);
            expect(parsed.categoria).toEqual(ProdutoDTOMock.categoria);
            expect(parsed.descricao).toEqual(ProdutoDTOMock.descricao);
            expect(parsed.imagem).toEqual(ProdutoDTOMock.imagem);
        });
    });
});
