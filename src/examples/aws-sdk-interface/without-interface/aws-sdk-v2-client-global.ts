import { DynamoDB } from 'aws-sdk';

export const dynamoDbDocumentClient = new DynamoDB.DocumentClient();
