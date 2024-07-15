import { ClienteMapper } from "adapters/mappers";

describe("Given ClienteMapper", () => {
    const mockNome = "John Doe";
    const mockEmail = "jdoe1@email.com";
    const mockCpf = "111.111.111-11";

    describe("When toDomain is called", () => {
        it("should parse a cliente DTO to Domain format", async () => {
            const parsed = ClienteMapper.toDomain({
                nome: mockNome,
                email: mockEmail,
                cpf: mockCpf,
            });

            expect(parsed.nome).toEqual(mockNome);
            expect(parsed.email.value).toEqual(mockEmail);
            expect(parsed.cpf.value).toEqual(mockCpf);
        });
    });
});
