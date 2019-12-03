// tslint:disable: no-internal-module
declare global {
  module NodeJS {
    interface Global {
      window: any;
    }
  }
}

if (typeof window === 'undefined') {
  global.window = {};
}

export * from './exportDebugHooks';
export * from './formatters';
export * from './interfaces';
export * from './Levels';
