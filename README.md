# Serverless Demo - CDK for Terraform

This an example for [CDK for Terraform](https://cdk.tf) (cdktf) to provision a simple AWS Lambda function behind an [HTTP Api Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html).

The demo case aims for a seamless developer experience and demonstrates the usage of 3rd party NPM packages as well. Note how [./main.my-handler.ts](./main.my-handler.ts) uses the [change-case](https://www.npmjs.com/package/change-case) npm package, which will be automatically inlined into the deployed Lambda function as part of the deployment process.

This automatic inlining is made possible by [./lib/esbuild-bundle](./lib/esbuild-bundle), which is mostly borrowed from the [AWS CDK](https://github.com/aws/aws-cdk/tree/05683907d6ffc9ab12b6744c1b59b0df096789e1/packages/%40aws-cdk/aws-lambda-nodejs). It's using [esbuild](https://github.com/evanw/esbuild) for bundling the Lambda function [as fast as possible](https://github.com/evanw/esbuild#why). You can find the bundled function in `./cdktf.out/assets` after a `cdktf synth` or a `cdktf deploy`).

### Please Note

To be clear: The bundling functionality is not part of `cdktf` right now. However, it's certainly something which I'd like to explore in the near future.

There are a few ways to make this accessible to a broader audience:

In the best case, the common bundle functionality of `esbuild-bundle` would be extracted as a dedicated package from AWS CDK directly. Alternatively, this could become a dedicated helper as part of `cdktf`. I could see this as quite useful, not only in the context of AWS Lambda, but similar offerings by other cloud providers as well.

### Usage

Note: A deployment expects a Terraform CLI binary in the path and valid AWS credentials in the environment.

```
npm install -g cdktf-cli // if not present already
yarn install
cdktf deploy
```