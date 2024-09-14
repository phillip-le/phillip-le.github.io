import { DynamoDB } from 'aws-sdk';
import type { IDynamoDBClientV2 } from './types.ts';

export const createDynamoDBClient = (): IDynamoDBClientV2 => {
  const documentClient = new DynamoDB.DocumentClient();

  return {
    put: (input) => documentClient.put(input).promise(),
    get: (input) => documentClient.get(input).promise(),
    scan: (input) => documentClient.scan(input).promise(),
  };
};
