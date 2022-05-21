import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';


export class GraphProcessorStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const input_bucket = new s3.Bucket(this, 'InputBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const preprocessor = new lambda.Function(this, 'InputPreprocessor', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'utils.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'code')),
      retryAttempts: 0
    });

    const queue = new sqs.Queue(this, 'GraphProcessorQueue', {
       visibilityTimeout: Duration.seconds(300)
    });
  }
}
