import {
  DynamoDBClient,
  type DynamoDBClientConfig,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  paginateScan,
} from '@aws-sdk/lib-dynamodb';
import type { IDynamoDBClientV3 } from './types.ts';

export const createDynamoDBClient = (
  config: DynamoDBClientConfig,
): IDynamoDBClientV3 => {
  const dynamoClient = new DynamoDBClient(config);
  const documentClient = DynamoDBDocumentClient.from(dynamoClient);

  return {
    put: (input) => documentClient.send(new PutCommand(input)),
    get: (input) => documentClient.send(new GetCommand(input)),
    paginateScan: ({ input, paginationOptions }) =>
      paginateScan(
        {
          client: documentClient,
          ...paginationOptions,
        },
        input,
      ),
  };
};
