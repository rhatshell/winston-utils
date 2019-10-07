import { Logger } from 'winston';

export const waitForLogger = <T>(instance: Logger) => {
  return new Promise<T>(resolve => {
    instance.on('close', resolve);
    instance.close();
  });
};
