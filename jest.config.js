import { createDefaultEsmPreset } from 'ts-jest';

/** @type {import('ts-jest').JestConfigWithTsJest} */
const defaultEsmPreset = createDefaultEsmPreset();

export default {
  ...defaultEsmPreset,
  testEnvironment: 'node',
  moduleNameMapper: {
    // This allows Jest to resolve clean relative imports
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};