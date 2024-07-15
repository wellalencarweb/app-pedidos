import { SQSClient } from "../client";

export class QueueManager {
    constructor(
        private readonly queueUrl: string,
        private readonly queueClient: typeof SQSClient,
    ) {}

    async enqueueMessage(message: string): Promise<void> {
        await this.queueClient
            .sendMessage({
                QueueUrl: this.queueUrl,
                MessageBody: message,
            })
            .promise();
    }
}
