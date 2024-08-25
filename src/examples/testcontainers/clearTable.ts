import {
  BatchWriteCommand,
  type BatchWriteCommandInput,
  type DynamoDBDocumentClient,
  paginateScan,
} from '@aws-sdk/lib-dynamodb';
import { cluster } from 'radash';

const DYNAMODB_MAX_BATCH_WRITE_LIMIT = 25 as const;

type DeleteRequest = NonNullable<
  BatchWriteCommandInput['RequestItems']
>[number][number];

export const clearTable = async <Item extends Record<string, unknown>>({
  tableName,
  dynamoDbDocumentClient,
  keyAttributes,
}: {
  tableName: string;
  dynamoDbDocumentClient: DynamoDBDocumentClient;
  keyAttributes: (keyof Item)[];
}) => {
  const paginator = paginateScan(
    {
      client: dynamoDbDocumentClient,
    },
    {
      TableName: tableName,
      AttributesToGet: keyAttributes as string[],
    },
  );

  const itemsToDelete: DeleteRequest[] = [];
  for await (const page of paginator) {
    const deleteRequests = page.Items?.map(
      (item): DeleteRequest => ({
        DeleteRequest: {
          Key: item,
        },
      }),
    );
    itemsToDelete.push(...(deleteRequests ?? []));
  }

  // splits into groups of size DYNAMODB_MAX_BATCH_WRITE_LIMIT
  // https://radash-docs.vercel.app/docs/array/cluster
  const deletionPromises = cluster(
    itemsToDelete,
    DYNAMODB_MAX_BATCH_WRITE_LIMIT,
  ).map((chunkItemsToDelete) =>
    dynamoDbDocumentClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: chunkItemsToDelete,
        },
      }),
    ),
  );

  await Promise.all(deletionPromises);
};
