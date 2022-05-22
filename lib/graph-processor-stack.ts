import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';


export class GraphProcessorStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const input_bucket = new s3.Bucket(this, 'InputBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const queue = new sqs.Queue(this, 'GraphProcessorQueue', {
      visibilityTimeout: Duration.seconds(300)
    });

    const preprocessor = new lambda.Function(this, 'InputPreprocessor', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'utils.preprocess',
      code: lambda.Code.fromAsset(path.join(__dirname, 'code')),
      retryAttempts: 0,
      environment: { "target_queue": queue.queueName }
    });

    input_bucket.grantRead(preprocessor);
    input_bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED, 
      new s3n.LambdaDestination(preprocessor), {
        suffix: '.dat'
    });

    queue.grantSendMessages(preprocessor);

    const compute_properties = new lambda.Function(this, 'ComputeProperties', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'utils.compute_properties',
      code: lambda.Code.fromAsset(path.join(__dirname, 'code')),
      retryAttempts: 0,
      environment: { "target_queue": queue.queueName }
    })

    const eventSource = new SqsEventSource(queue);
    compute_properties.addEventSource(eventSource);
  }
}
