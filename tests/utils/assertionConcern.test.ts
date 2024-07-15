import { PedidoMapper } from "adapters/mappers";
import { Item, StatusPagamentoEnum, StatusPedidoEnum } from "entities/pedido";
import { ClienteDTO } from "external/clienteService";
import { PedidoDTO } from "useCases";
import { AssertionConcern } from "utils/assertionConcern";
import { ValidationError } from "utils/errors/validationError";

describe("Given AssertionConcern", () => {
    describe("When assertArgumentNotEmpty is called", () => {
        it("should validate filled string", () => {
            const value = "Test-String";
            AssertionConcern.assertArgumentNotEmpty(
                value,
                "String is required",
            );
        });
        it("should throw an error for empty value", () => {
            expect(() =>
                AssertionConcern.assertArgumentNotEmpty(
                    null,
                    "String is required",
                ),
            ).toThrowError(ValidationError);
        });
    });
    describe("When assertArgumentMaxLength is called", () => {
        const testString = "123456";
        const erroMessage = "String max length";

        it("should validate string max size", () => {
            AssertionConcern.assertArgumentMaxLength(
                testString,
                10,
                erroMessage,
            );
        });
        it("should throw an error for icorrect max string size", () => {
            expect(() =>
                AssertionConcern.assertArgumentMaxLength(
                    testString,
                    5,
                    erroMessage,
                ),
            ).toThrowError(ValidationError);
        });
    });
    describe("When assertArgumentMinLength is called", () => {
        const testString = "123456";
        const erroMessage = "String min length";

        it("should validate min string size", () => {
            const value = "Test-String";
            AssertionConcern.assertArgumentMinLength(
                testString,
                5,
                erroMessage,
            );
        });
        it("should throw an error for icorrect min string size", () => {
            expect(() =>
                AssertionConcern.assertArgumentMinLength(
                    testString,
                    10,
                    erroMessage,
                ),
            ).toThrowError(ValidationError);
        });
    });
    describe("When assertArgumentIsValid is called", () => {
        const testValue = "value-1";
        const testList = ["value-1", "value-2", "value-3"];
        const erroMessage = "Value is not in allowed list";

        it("should validate if value is inside allowed list", () => {
            AssertionConcern.assertArgumentIsValid(
                testValue,
                testList,
                erroMessage,
            );
        });
        it("should throw an error if value is not in allowed list", () => {
            expect(() =>
                AssertionConcern.assertArgumentIsValid(
                    "asd",
                    testList,
                    erroMessage,
                ),
            ).toThrowError(ValidationError);
        });
    });
    describe("When assertArgumentIsValidEmail is called", () => {
        const testValue = "john.doe@email.com";
        const erroMessage = "Value is not a valid email";

        it("should validate if value is in email format", () => {
            AssertionConcern.assertArgumentIsValidEmail(testValue, erroMessage);
        });
        it("should throw an error if value is not in email format", () => {
            expect(() =>
                AssertionConcern.assertArgumentIsValidEmail(
                    "test@email",
                    erroMessage,
                ),
            ).toThrowError(ValidationError);
        });
    });
    describe("When assertArgumentIsObject is called", () => {
        it("should validate if value is object", () => {
            const testValue = { value: 1 };
            const result = AssertionConcern.assertArgumentIsObject(testValue);
            expect(result).toBe(true);
        });
        it("should return false if value is not an object", () => {
            const testValue = "value";
            const result = AssertionConcern.assertArgumentIsObject(testValue);
            expect(result).toBe(false);
        });
    });
    describe("When assertObjectEquality is called", () => {
        it("should validate equality between two objects", () => {
            const testValue1 = { value: 1 };
            const testValue2 = { value: 1 };

            const result = AssertionConcern.assertObjectEquality(
                testValue1,
                testValue2,
            );
            expect(result).toBe(true);
        });
        it("should validate equality between two objects and internal objects", () => {
            const testValue1 = { value: 1, object: { value: 2 } };
            const testValue2 = { value: 1, object: { value: 2 } };

            const result = AssertionConcern.assertObjectEquality(
                testValue1,
                testValue2,
            );
            expect(result).toBe(true);
        });
        it("should return false if there is no equality between objects", () => {
            const testValue1 = { value: 1 };
            const testValue2 = { value: 2 };

            const result = AssertionConcern.assertObjectEquality(
                testValue1,
                testValue2,
            );
            expect(result).toBe(false);
        });
        it("should return false if there no properties to compare", () => {
            const testValue1 = { value: 1 };
            const testValue2 = {};

            const result = AssertionConcern.assertObjectEquality(
                testValue1,
                testValue2,
            );
            expect(result).toBe(false);
        });
    });
    describe("When assertArgumentHasQuantityAndPrice is called", () => {
        it("should validate list of itens", () => {
            const testValue: Item[] = [
                { produtoId: "1", quantidade: 1, preco: 10 },
            ];
            AssertionConcern.assertArgumentHasQuantityAndPrice(
                testValue,
                "List does not contain required fields",
            );
        });
        it("should throw an error if list itens does not contain required fields", () => {
            const testValue: Partial<Item>[] = [{ produtoId: "2" }];

            expect(() =>
                AssertionConcern.assertArgumentHasQuantityAndPrice(
                    // @ts-ignore
                    testValue,
                    "List does not contain required fields",
                ),
            ).toThrowError();
        });
    });
    describe("When assertArgumentIsObjectId is called", () => {
        it("should validate an object id", () => {
            AssertionConcern.assertArgumentIsObjectId(
                "64f347311cdbc9683543af27",
                "Value should be an object id",
            );
        });
        it("should throw an error if value is not in object format", () => {
            expect(() =>
                AssertionConcern.assertArgumentIsObjectId(
                    "testValue",
                    "Value should be an object id",
                ),
            ).toThrowError(ValidationError);
        });
    });
});
