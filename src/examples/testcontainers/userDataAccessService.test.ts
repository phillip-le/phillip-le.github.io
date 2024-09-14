import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { GenericContainer, type StartedTestContainer } from 'testcontainers';
import { clearTable } from './clearTable';
import { type DynamoClient, createDynamoClient } from './dynamoClient';
import {
  type User,
  type UserDataAccessService,
  createUserDataAccessService,
} from './userDataAccessService';

describe(
  'userDataAccessService',
  {
    timeout: 15_000,
  },
  () => {
    let container: StartedTestContainer;
    let dynamoClient: DynamoClient;
    let userDataAccessService: UserDataAccessService;
    const usersTableName = 'Users';

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
      userDataAccessService = createUserDataAccessService({
        tableName: usersTableName,
        dynamoClient,
      });

      await dynamoClient.createTable({
        TableName: usersTableName,
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

    afterEach(async () => {
      await clearTable<User>({
        tableName: usersTableName,
        dynamoDbDocumentClient: dynamoClient.documentClient,
        keyAttributes: ['email'],
      });
    });

    afterAll(async () => {
      await container.stop();
    });

    it('should create a new user record', async () => {
      await userDataAccessService.createUser('test@test.com');

      const createdUser = await userDataAccessService.getUser('test@test.com');

      expect(createdUser).toEqual<User>({
        email: 'test@test.com',
      });
    });

    it('should throw an error when creating a user where email is already used', async () => {
      const conflictingEmail = 'a@test.com';
      await userDataAccessService.createUser(conflictingEmail);

      await expect(
        userDataAccessService.createUser(conflictingEmail),
      ).rejects.toThrow(ConditionalCheckFailedException);
    });
  },
);
