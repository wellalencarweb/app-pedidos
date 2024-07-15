import { SQS } from "aws-sdk";
import { serverConfig } from "config";

export const SQSClient = new SQS({
    region: serverConfig.sqs.region,
    accessKeyId: serverConfig.sqs.accessKeyId,
    secretAccessKey: serverConfig.sqs.secretAccessKey,
});
