import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const dynamoDbClient = new DynamoDBClient();

export const dynamoDbDocumentClient =
  DynamoDBDocumentClient.from(dynamoDbClient);
