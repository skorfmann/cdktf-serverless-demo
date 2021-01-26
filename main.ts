import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput } from 'cdktf';
import * as aws from '@cdktf/provider-aws';
import { NodejsFunction } from './lib/esbuild-bundle';
import { Policy } from './lib/policy';
import * as iam from 'iam-floyd';
import * as path from 'path';

class ServerlessExample extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new aws.AwsProvider(this, 'default', {
      region: 'eu-central-1'
    })

    const fnName = `api-handler`;

    const role = new aws.IamRole(this, 'role', {
      name: `${fnName}-role`,
      assumeRolePolicy: Policy.document(new iam.Sts()
        .allow()
        .toAssumeRole()
        .forService('lambda.amazonaws.com')
      )
    })

    const bundle = new NodejsFunction(this, 'my-handler', {
      entry: path.join(__dirname, 'main.my-handler.ts')
    });

    const fn = new aws.LambdaFunction(this, 'fn', {
      functionName: fnName,
      role: role.arn,
      handler: bundle.handler,
      filename: bundle.assetPath,
      sourceCodeHash: bundle.assetHash,
      runtime: bundle.runtime.name
    })

    const api = new aws.Apigatewayv2Api(this, 'api', {
      name: 'demo',
      protocolType: 'HTTP',
      target: fn.arn
    })

    new aws.LambdaPermission(this, 'fn-api', {
      functionName: fn.arn,
      action: "lambda:InvokeFunction",
      principal: "apigateway.amazonaws.com",
      sourceArn: `${api.executionArn}/*/*`
    })

    new TerraformOutput(this, 'url', {
      value: api.apiEndpoint
    })
  }
}

const app = new App();
new ServerlessExample(app, 'serverless');
app.synth();