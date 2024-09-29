import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, paginateScan } from '@aws-sdk/lib-dynamodb';
import type { IDynamoDBClientV3 } from './types.ts';

class DynamoDBClientV3 extends DynamoDBDocument implements IDynamoDBClientV3 {
  static override from(client: DynamoDBClient) {
    return new DynamoDBClientV3(client);
  }

  paginateScan = ({
    input,
    paginationOptions,
  }: Parameters<IDynamoDBClientV3['paginateScan']>[0]) => {
    return paginateScan(
      {
        client: this,
        ...paginationOptions,
      },
      input,
    );
  };
}

export const createDynamoDBClient = (): IDynamoDBClientV3 => {
  const dynamoClient = new DynamoDBClient();
  return DynamoDBClientV3.from(dynamoClient);
};
