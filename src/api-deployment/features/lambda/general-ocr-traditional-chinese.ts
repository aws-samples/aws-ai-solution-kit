import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FeatureNestedStack, FeatureNestedStackProps } from '../../feature-nested-stack';
import { LambdaFeatureConstruct } from '../../lambda-feature-construct';

export class GeneralOCRTraditionalChineseFeatureNestedStack extends FeatureNestedStack {
  constructor(scope: Construct, id: string, props: FeatureNestedStackProps) {

    super(scope, id, props);
    const featureName = 'general-ocr-traditional-chinese';
    this.templateOptions.description = '(SO8023-ocr-traditional) - AI Solution Kit - General OCR Traditional Chinese. Template version v1.4.0. See https://awslabs.github.io/aws-ai-solution-kit/en/deploy-general-ocr-traditional.';

    new LambdaFeatureConstruct(this, `${featureName}`, {
      rootRestApi: props.restApi,
      authorizationType: props.customAuthorizationType,
      restApiResourcePath: 'lite-ocr-traditional-chinese',
      lambdaEcrDeployment: props.ecrDeployment,
      lambdaDockerImageUrl: `${props.ecrRegistry}/general-ocr-traditional-chinese:latest`,
      featureName: `${featureName}`,
      featureCategory: 'media',
      updateCustomResourceProvider: props.updateCustomResourceProvider,
      lambdaMemorySize: props.lambdaMemorySize,
      lambdaTimeout: Duration.seconds(30),
    });
  }
}
