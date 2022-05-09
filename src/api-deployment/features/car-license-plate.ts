import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { APIFeature } from '../../api-feature';
import { FeatureNestedStack, FeatureNestedStackProps } from '../feature-nested-stack';
import { LambdaFeatureConstruct } from '../lambda-feature-construct';

export class CarLicensePlateFeatureNestedStack extends FeatureNestedStack {
  constructor(scope: Construct, id: string, props: FeatureNestedStackProps) {

    super(scope, id, props);
    const featureName = 'car-license-plate';
    this.templateOptions.description = '(SO8023-car-license-plate) - AI Solution Kit - Car License Plate. Template version v1.2.0. See https://aws-samples.github.io/aws-ai-solution-kit/en/deploy-car-license-plate.';

    new LambdaFeatureConstruct(this, featureName, {
      rootRestApi: props.restApi,
      authorizationType: props.customAuthorizationType,
      restApiResourcePath: `${featureName}`,
      lambdaEcrDeployment: props.ecrDeployment,
      lambdaDockerImageUrl: `${props.ecrRegistry}/${featureName}:latest`,
      featureName: `${featureName}`,
      featureCategory: 'media',
      updateCustomResourceProvider: props.updateCustomResourceProvider,
      lambdaMemorySize: 4096,
      lambdaTimeout: Duration.seconds(19),
    });
  }
}
