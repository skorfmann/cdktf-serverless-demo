import { Construct, IAspect } from 'constructs';
import { TerraformAsset, AssetType } from 'cdktf';
import * as aws from '@cdktf/provider-aws';
import * as path from 'path';
import { mkdirSync, writeFileSync } from 'fs';

export const stubLambdaFunction = (lambda: aws.LambdaFunction, handler: (event: any) => boolean) => {
  const tmpWorkDir = path.join(process.cwd(), 'tmp', 'build', 'authorizer')
  mkdirSync(tmpWorkDir, { recursive: true })
  const filePath = path.join(tmpWorkDir, 'index.js')
  writeFileSync(filePath, `
const stubbedHandler = ${handler.toString()}

const handler = async (event) => {
  return stubbedHandler()
}

module.exports = {
  handler
}
`
  )

  const asset = new TerraformAsset(lambda, 'stubbed-lambda-asset', {
    path: tmpWorkDir,
    type: AssetType.ARCHIVE,
  });

  lambda.addOverride('filename', asset.path);
  lambda.addOverride('source_code_hash', asset.assetHash);
}

export class StubLambda implements IAspect {
  constructor(private stub: (event: any) => any) {}

  public visit(node: Construct): void {
    if (node instanceof aws.LambdaFunction) {
      stubLambdaFunction(node, this.stub)
    }
  }
}
