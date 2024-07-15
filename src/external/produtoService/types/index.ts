export interface ProdutoDTO {
    id?: string;
    nome: string;
    preco: number;
    categoria: "lanche" | "bebida" | "acompanhamento" | "sobremesa";
    descricao: string;
    imagem: string;
}
