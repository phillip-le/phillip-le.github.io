import { GenericContainer, type StartedTestContainer } from 'testcontainers';
import { clearTable } from './clearTable';
import { type DynamoClient, createDynamoClient } from './dynamoClient';
import type { User } from './userDataAccessService';

describe(
  'clearTable',
  {
    timeout: 15_000,
  },
  () => {
    let container: StartedTestContainer;
    let dynamoClient: DynamoClient;
    const tableName = 'Users';

    beforeAll(async () => {
      const dynamoDbContainer = new GenericContainer(
        'amazon/dynamodb-local',
      ).withExposedPorts(8000);
      container = await dynamoDbContainer.start();
      dynamoClient = createDynamoClient({
        endpoint: `http://${container.getHost()}:${container.getMappedPort(8000)}`,
        region: 'ap-southeast-2',
        credentials: {
          accessKeyId: 'dummy',
          secretAccessKey: 'dummy',
        },
      });

      await dynamoClient.createTable({
        TableName: tableName,
        KeySchema: [
          {
            AttributeName: 'email',
            KeyType: 'HASH',
          },
        ],
        AttributeDefinitions: [
          {
            AttributeName: 'email',
            AttributeType: 'S',
          },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      });
    });

    afterAll(async () => {
      await container.stop();
    });

    it('should delete all items in table', async () => {
      await Promise.all(
        [...Array(30).keys()].map((_, i) =>
          dynamoClient.put({
            TableName: tableName,
            Item: {
              email: `${i}@test.com`,
            },
          }),
        ),
      );

      const { Count: itemsCreatedCount } = await dynamoClient.scan({
        TableName: tableName,
      });

      expect(itemsCreatedCount).toEqual(30);

      await clearTable<User>({
        tableName,
        dynamoDbDocumentClient: dynamoClient.documentClient,
        keyAttributes: ['email'],
      });

      const { Count: itemsAfterClearCount } = await dynamoClient.scan({
        TableName: tableName,
      });

      expect(itemsAfterClearCount).toEqual(0);
    });
  },
);
