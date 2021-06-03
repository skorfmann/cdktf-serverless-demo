import { pascalCase } from 'change-case';

export const handler = async (_event: any) => {
  return pascalCase('Hello World')
}