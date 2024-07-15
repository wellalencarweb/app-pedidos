import { parseEnvInt, parseEnvStr } from "./utils";

export const serverConfig = {
    env: parseEnvStr("NODE_ENV", "development"),
    port: parseEnvInt("PORT", 6004),
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",
    clienteService: {
        url: parseEnvStr(
            "CLIENTE_SERVICE_URL",
            "http://localhost:6001/api/cliente",
        ),
    },
    produtoService: {
        url: parseEnvStr(
            "PRODUTO_SERVICE_URL",
            "http://localhost:6002/api/produto",
        ),
    },
    mongo: {
        dbName: parseEnvStr("MONGO_DB_NAME", "fast_food"),
        connectionString: parseEnvStr(
            "MONGODB_CONN_STRING",
            "mongodb://localhost:27017",
        ),
    },
    sqs: {
        region: parseEnvStr("SQS_REGION"),
        accessKeyId: parseEnvStr("SQS_ACCESS_KEY_ID"),
        secretAccessKey: parseEnvStr("SQS_SECRET_ACCESS_KEY"),
        pollingWaitTimeMs: parseEnvInt("SQS_POLLING_WAIT_TIME", 0),
    },
    queues: {
        confirmacaoPagemento: parseEnvStr(
            "QUEUE_CONFIRMACAO_PAGAMENTO",
            "https://sqs.us-east-1.amazonaws.com/146747026776/confirmacao-pagamento",
        ),
        notificaoCliente: parseEnvStr(
            "QUEUE_NOTIFICAO_CLIENTE",
            "https://sqs.us-east-1.amazonaws.com/146747026776/notificacao-cliente",
        ),
        anonimizacaoCliente: parseEnvStr(
            "QUEUE_ANONIMIZACAO_CLIENTE",
            "https://sqs.us-east-1.amazonaws.com/146747026776/anonimizacao-cliente",
        ),
    },
} as const;
