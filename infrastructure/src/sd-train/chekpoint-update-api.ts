import { PythonFunction, PythonFunctionProps } from '@aws-cdk/aws-lambda-python-alpha';
import {
  aws_apigateway,
  aws_apigateway as apigw,
  aws_dynamodb,
  aws_iam,
  aws_lambda, aws_s3,
  Duration,
} from 'aws-cdk-lib';
import { MethodOptions } from 'aws-cdk-lib/aws-apigateway/lib/method';
import { Effect } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';


export interface UpdateCheckPointApiProps {
  router: aws_apigateway.Resource;
  httpMethod: string;
  checkpointTable: aws_dynamodb.Table;
  srcRoot: string;
  commonLayer: aws_lambda.LayerVersion;
  s3Bucket: aws_s3.Bucket;
}

export class UpdateCheckPointApi {
  private readonly src;
  private readonly router: aws_apigateway.Resource;
  private readonly httpMethod: string;
  private readonly scope: Construct;
  private readonly checkpointTable: aws_dynamodb.Table;
  private readonly layer: aws_lambda.LayerVersion;
  private readonly s3Bucket: aws_s3.Bucket;

  private readonly baseId: string;

  constructor(scope: Construct, id: string, props: UpdateCheckPointApiProps) {
    this.scope = scope;
    this.src = props.srcRoot;
    this.layer = props.commonLayer;
    this.baseId = id;
    this.router = props.router;
    this.httpMethod = props.httpMethod;
    this.checkpointTable = props.checkpointTable;
    this.s3Bucket = props.s3Bucket;

    this.updateCheckpointApi();
  }

  private iamRole(): aws_iam.Role {
    const newRole = new aws_iam.Role(this.scope, `${this.baseId}-update-role`, {
      assumedBy: new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
    });
    newRole.addToPolicy(new aws_iam.PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'dynamodb:BatchGetItem',
        'dynamodb:GetItem',
        'dynamodb:Scan',
        'dynamodb:Query',
        'dynamodb:UpdateItem',
      ],
      resources: [this.checkpointTable.tableArn],
    }));

    newRole.addToPolicy(new aws_iam.PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      resources: ['*'],
    }));
    return newRole;
  }

  private updateCheckpointApi() {
    const lambdaFunction = new PythonFunction(this.scope, `${this.baseId}-update`, <PythonFunctionProps>{
      functionName: `${this.baseId}-update-checkpoint`,
      entry: `${this.src}/create_model`,
      architecture: Architecture.X86_64,
      runtime: Runtime.PYTHON_3_9,
      index: 'checkpoint_api.py',
      handler: 'update_checkpoint_api',
      timeout: Duration.seconds(900),
      role: this.iamRole(),
      memorySize: 1024,
      environment: {
        CHECKPOINT_TABLE: this.checkpointTable.tableName,
        S3_BUCKET: this.s3Bucket.bucketName,
      },
      layers: [this.layer],
    });
    const createModelIntegration = new apigw.LambdaIntegration(
      lambdaFunction,
      {
        proxy: false,
        integrationResponses: [{ statusCode: '200' }],
      },
    );
    this.router.addMethod(this.httpMethod, createModelIntegration, <MethodOptions>{
      apiKeyRequired: true,
      methodResponses: [{
        statusCode: '200',
      }],
    });
  }
}

