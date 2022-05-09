#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { BootstraplessStackSynthesizer } from 'cdk-bootstrapless-synthesizer';
import 'source-map-support/register';
import { AISolutionKitStack } from './api-deployment/ai-solution-kit-stack';
import { LambdaContainersStack } from './containers/lambda-containers-stack';


const app = new App();
const buildContainers = app.node.tryGetContext('build-container');
const deployContainers = app.node.tryGetContext('deploy-container');

if (buildContainers === 'true' || deployContainers === 'true') {
  console.log('Building containers');
  // Docker images building stack
  new LambdaContainersStack(app, 'Lambda-Containers-Stack', {
    synthesizer: synthesizer(),
  });
} else {
  // CloudFormation deployment stack - Default
  const ecrRegistry = app.node.tryGetContext('ecrRegistry');
  console.log('Use ECR Resistry: ' + ecrRegistry);

  new AISolutionKitStack(app, 'AI-Solution-Kit', {
    synthesizer: synthesizer(),
    ecrRegistry: ecrRegistry === 'undefined' ? 'public.ecr.aws/aws-gcr-solutions/aws-gcr-ai-solution-kit' : ecrRegistry,
  });
}

app.synth();

function synthesizer() {
  return process.env.USE_BSS ? new BootstraplessStackSynthesizer() : undefined;
}