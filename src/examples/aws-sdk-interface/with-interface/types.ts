import type {
  GetCommandInput,
  GetCommandOutput,
  Paginator,
  PutCommandInput,
  PutCommandOutput,
  ScanCommandInput,
  ScanCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import type { PaginationConfiguration } from '@aws-sdk/lib-dynamodb';
import type { DynamoDB } from 'aws-sdk';

export type IDynamoDBClientV3 = {
  put: (input: PutCommandInput) => Promise<PutCommandOutput>;
  get: (input: GetCommandInput) => Promise<GetCommandOutput>;
  paginateScan: (params: {
    input: ScanCommandInput;
    paginationOptions: Omit<PaginationConfiguration, 'client'>;
  }) => Paginator<ScanCommandOutput>;
};

export type IDynamoDBClientV2 = {
  put: (
    input: DynamoDB.DocumentClient.PutItemInput,
  ) => Promise<DynamoDB.DocumentClient.PutItemOutput>;
  get: (
    input: DynamoDB.DocumentClient.GetItemInput,
  ) => Promise<DynamoDB.DocumentClient.GetItemOutput>;
  scan: (
    input: DynamoDB.DocumentClient.ScanInput,
  ) => Promise<DynamoDB.DocumentClient.ScanOutput>;
};
