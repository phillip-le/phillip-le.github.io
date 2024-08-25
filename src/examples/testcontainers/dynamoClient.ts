import {
  CreateTableCommand,
  type CreateTableCommandInput,
  type CreateTableCommandOutput,
  DynamoDBClient,
  type DynamoDBClientConfig,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  type GetCommandInput,
  type GetCommandOutput,
  PutCommand,
  type PutCommandInput,
  type PutCommandOutput,
  ScanCommand,
  type ScanCommandInput,
  type ScanCommandOutput,
} from '@aws-sdk/lib-dynamodb';

export type DynamoClient = {
  createTable: (
    input: CreateTableCommandInput,
  ) => Promise<CreateTableCommandOutput>;
  put: (input: PutCommandInput) => Promise<PutCommandOutput>;
  get: (input: GetCommandInput) => Promise<GetCommandOutput>;
  scan: (input: ScanCommandInput) => Promise<ScanCommandOutput>;
  documentClient: DynamoDBDocumentClient;
};

export const createDynamoClient = (
  config: DynamoDBClientConfig,
): DynamoClient => {
  const dynamoDbClient = new DynamoDBClient(config);
  const dynamoDbDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient);

  return {
    createTable: (input) => dynamoDbClient.send(new CreateTableCommand(input)),
    put: (input) => dynamoDbDocumentClient.send(new PutCommand(input)),
    get: (input) => dynamoDbDocumentClient.send(new GetCommand(input)),
    scan: (input) => dynamoDbDocumentClient.send(new ScanCommand(input)),
    documentClient: dynamoDbDocumentClient,
  };
};
