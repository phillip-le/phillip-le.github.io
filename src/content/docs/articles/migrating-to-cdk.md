---
title: 'Migrating AWS resources to AWS CDK'
lastUpdated: 2024-07-09
---

This guide describes how to migrate resources from an existing `CloudFormation` or `serverless` definition to a CDK stack. This also applies for resources that have been created using clickops. 

This guide is mostly concerned with no downtime migration of stateful resources where destroying and re-creating the resource is unacceptable. Usually, stateless resources such as lambdas can have multiple simultaneous deployments (e.g. one defined in CDK and one defined in `serverless`) at once and the migration would involve simply switching the traffic between the two deployments and tearing down the old infrastructure afterwards.

### Prerequisites

- Ensure that the resources you want to migrate can be imported by checking [this list](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resource-import-supported-resources.html).
- We will be using `cdk import` which does not support importing resources into nested stacks.

### Alternatives

Note that there is a [cdk migrate](https://docs.aws.amazon.com/cdk/v2/guide/migrate.html#migrate-intro) tool available for migrating resources to CDK with minimal effort. However, that approach means that you cannot take advantage of many of the features of AWS CDK. I have not used `cdk migrate` extensively but I think that the deal breaker of `cdk migrate` is that it likely does not handle stack definitions which are deployed to different AWS accounts e.g. a single stack which is deployed to `staging` and `production` AWS accounts. 

### Check your CloudFormation stack for drift

We want to ensure that our changes have not created any new [drift](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-stack-drift.html#what-is-drift). Follow [this guide](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/detect-drift-stack.html) to detect drift on your existing CloudFormation stack. If possible, try to any existing drift before proceeding because drift can result in unexpected behaviour when modifying CloudFormation stacks. Otherwise, the best outcome will be ensuring that the resources have the same drift after migrating to CDK.

### Add the `DeletionPolicy: Retain` policy on resources

If your resource is defined in `CloudFormation` or `serverless.yml`, ensure that it has the [DeletionPolicy](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-deletionpolicy.html) with the value of `Retain` or `RetainExceptOnCreate`. If your resource was created using clickops, then you can ignore this step.

### Replace all `!Ref` and `!GetAtt` usages with interpolated ARNs

[!Ref](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-ref.html) and [!GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html) only works for resources within the same stack. When we migrate the resources to another stack, especially when it is done incrementally, these usages of `!Ref` will break.

```diff lang="yaml"
Resources:
  UserTable:
    Type: 'AWS::DynamoDB::Table'
    DeletionPolicy: RetainExceptOnCreate
    Properties: 
      TableName: 'User'
      AttributeDefinitions: 
        - AttributeName: 'id'
          AttributeType: 'S'
      KeySchema: 
        - AttributeName: 'id'
          KeyType: 'HASH'
      BillingMode: 'PAY_PER_REQUEST'

  UserTableReadRole:
    Type: 'AWS::IAM::Role'
    DeletionPolicy: RetainExceptOnCreate
    Properties:
      AssumeRolePolicyDocument:
      # ...
      Policies:
        - PolicyName: 'DynamoDBReadAccessPolicy'
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - 'dynamodb:BatchGetItem'
                Resource: 
-                  - !GetAtt UserTable.Arn
+                  - arn:aws:dynamodb:us-west-2:123456789012:table/User
```

### Create a new empty CDK stack

You can skip this step if you already have an existing CDK stack that you want to migrate resources into. 

Firstly, ensure that you have [bootstrapped](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) your AWS account so that you can use AWS CDK.

Next, create an **empty** CDK stack following [this guide](https://github.com/aws/aws-cdk?tab=readme-ov-file#getting-started) as a reference. 

```sh
mdkir test-cdk-app
cd test-cdk-app
pnpm dlx cdk init app --language=typescript
```

You can delete any resource definitions created as part of the scaffolded `cdk init` command and keep an empty stack definition like this:

```ts
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class TestCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Add resource definitions here later
  }
}
```

Deploy the empty CDK stack. It is important that we deploy the stack before we add resource definitions for the resources that we want to migrate to this stack.

```sh
cdk deploy
```

### Define the resources in CDK

Take a look at your `CloudFormation` or `serverless` file. If you created the resource using clickops you can take a look at the [IaC generator](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/generate-IaC.html) to help you. You want to create the exact same resource definition in AWS CDK. The important differences are that you **should** use [L2 constructs](https://docs.aws.amazon.com/cdk/v2/guide/constructs.html) where possible. 

For example, the DynamoDB table that was defined in `CloudFormation` previously would look like:

```ts
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class TestCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new dynamodb.Table(this, "UserTable", {
      tableName: "User",
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    });
  }
}
```

You will notice that when using L2 constructs, we do not need to define every single attribute like in `CloudFormation`. For example, `KeySchema` does not need to be set explicitly.

To verify that you have matched the original `CloudFormation` definition, you can create a snapshot of the `CloudFormation` that CDK will generate and compare it with the original `CloudFormation` definition:

```ts
import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { TestCdkAppStack } from "../lib/test-cdk-app-stack";

test("User table", () => {
  const app = new cdk.App();
  const stack = new TestCdkAppStack(app, "MyTestStack");
  const template = Template.fromStack(stack);

  expect(template.toJSON()).toMatchSnapshot();
});
```

:::caution
Do not deploy the CDK stack with these new resource definitions yet!
:::

### Orphan the resources from existing CloudFormation / serverless definitions

:::danger
Ensure that all resources that are going to be migrated have **DeletionPolicy: Retain**.
:::

Remove the resource definition of the resource that you want to migrate from the original `CloudFormation` or `serverless.yml` file. 

```diff lang="yaml"
Resources:
-  UserTable:
-    Type: 'AWS::DynamoDB::Table'
-    DeletionPolicy: RetainExceptOnCreate
-    Properties: 
-      TableName: 'User'
-      AttributeDefinitions: 
-        - AttributeName: 'id'
-          AttributeType: 'S'
-      KeySchema: 
-        - AttributeName: 'id'
-          KeyType: 'HASH'
-      BillingMode: 'PAY_PER_REQUEST'

  UserTableReadRole:
    Type: 'AWS::IAM::Role'
    DeletionPolicy: RetainExceptOnCreate
    Properties:
    # ...
```

Deploy the `CloudFormation` / `serverless` stack without the resource definitions.

### Import the resources into CDK

Import the resources using the AWS CDK cli. Follow [this guide](https://docs.aws.amazon.com/cdk/v2/guide/cli.html#cli-import) as a reference.

```sh
cdk import
```

### Check the CDK stack for stack drift

Ensure that the CDK stack has no unexpected stack drift. If there is stack drift, you can remove the resource definitions from your CDK stack and redeploy the stack which will orphan the resources again. Now, you can either update the CDK resource definitions to fix the drift errors e.g. if you were missing an attribute in your CDK resource definition, then you can add it and try to re-import it. Or you can abort the migration by re-adding the resource definitions to the original `CloudFormation` / `serverless` stacks and importing your orphaned resources into their original stacks.

🎉 If there is no unexpected stack drift, congratulations you have successfully migrated your resources to CDK. 🎉

### Referenced resources

1. [Supported Resources for CloudFormation Imports](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resource-import-supported-resources.html)
1. [AWS CDK CLI Migrate Command Guide](https://docs.aws.amazon.com/cdk/v2/guide/migrate.html#migrate-intro)
1. [Detect Stack Drift in CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/detect-drift-stack.html)
1. [DeletionPolicy Attribute in CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-deletionpolicy.html)
1. [AWS CloudFormation !Ref Function Reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-ref.html)
1. [AWS CloudFormation !GetAtt Function Reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html)
1. [Generate Infrastructure as Code](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/generate-IaC.html)
1. [AWS CDK Getting Started Guide](https://github.com/aws/aws-cdk?tab=readme-ov-file#getting-started)
1. [AWS CDK CLI Import Command](https://docs.aws.amazon.com/cdk/v2/guide/cli.html#cli-import)
