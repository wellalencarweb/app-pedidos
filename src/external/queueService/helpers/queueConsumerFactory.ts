import { Consumer } from "sqs-consumer";
import { Message, SQSClient } from "@aws-sdk/client-sqs";
import { serverConfig } from "config";

interface CreationParams {
    name?: string;
    queueUrl: string;
    handler: (message: Message) => Promise<Message | void>;
}

export class QueueConsumerFactory {
    public static create(params: CreationParams): Consumer {
        const { queueUrl, handler, name = "consumer" } = params;

        const consumer = Consumer.create({
            queueUrl,
            handleMessage: handler,
            pollingWaitTimeMs: serverConfig.sqs.pollingWaitTimeMs,
            sqs: new SQSClient({
                region: serverConfig.sqs.region,
                credentials: {
                    accessKeyId: serverConfig.sqs.accessKeyId,
                    secretAccessKey: serverConfig.sqs.secretAccessKey,
                },
            }),
        });

        consumer.on("started", () => {
            console.log(`Queue '${name}' started listening`);
        });

        consumer.on("message_received", (message) => {
            console.log(
                `Queue '${name}' received message:`,
                message?.MessageId,
            );
        });

        consumer.on("error", (err) => {
            console.error(`Queue '${name}' error: `, err.message);
        });

        consumer.on("processing_error", (err) => {
            console.error(`Queue '${name}' processing_error: `, err.message);
        });

        consumer.on("timeout_error", (err) => {
            console.error(`Queue '${name}' timeout_error: `, err.message);
        });

        return consumer;
    }
}
