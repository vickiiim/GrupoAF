import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import ts from 'typescript';

// Path aliases (e.g. the ones added by `nest g library`) live in tsconfig.json,
// so they are read from there instead of being duplicated here.
const { config: tsconfig } = ts.readConfigFile(
  './tsconfig.json',
  ts.sys.readFile,
);
const paths = tsconfig?.compilerOptions?.paths ?? {};

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    // Los fuentes del proyecto se compilan con ts-jest (respeta
    // emitDecoratorMetadata, indispensable para la inyeccion de Nest).
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  // NestJS 12 se distribuye en ESM puro: los paquetes de node_modules NO se
  // transpilan, se cargan como ESM nativo (requiere --experimental-vm-modules).
  transformIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    // Los fuentes usan especificadores ESM con extension (.js) -> se quitan
    // para que el resolver de Jest encuentre los archivos .ts.
    '^(\\.{1,2}/.*)\\.js$': '$1',
    ...pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' }),
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    'libs/**/*.(t|j)s',
    'apps/**/*.(t|j)s',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;
