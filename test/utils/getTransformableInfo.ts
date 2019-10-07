import _ from 'lodash';
import { TransformableInfo } from 'logform';
import { createLogger, format, LogCallback, Logger, transports } from 'winston';
import { waitForLogger } from './waitForLogger';

class SyncLogger {
  static async getTransformableInfo<T extends TransformableInfo>(message: string, callback: LogCallback): Promise<T>;
  static async getTransformableInfo<T extends TransformableInfo>(
    message: string,
    meta: any,
    callback: LogCallback,
  ): Promise<T>;
  static async getTransformableInfo<T extends TransformableInfo>(message: string, ...meta: any[]): Promise<T>;
  static async getTransformableInfo<T extends TransformableInfo>(message: string | object): Promise<T>;
  static async getTransformableInfo<T extends TransformableInfo>(message: string, ...args: any[]): Promise<T> {
    let currentInfo: T;
    const logger = createLogger({
      level: 'info',
      format: format.json(),
      defaultMeta: { service: 'winston-utils' },
      transports: [
        new transports.Console({
          format: format.combine({
            options: undefined,
            transform: (info: T) => {
              currentInfo = info;
              return undefined;
            },
          }),
        }),
      ],
    });

    if (_.isObject(message)) {
      logger.info(message);
    } else {
      logger.info(message, ...args);
    }
    await waitForLogger<Logger>(logger);

    return currentInfo;
  }
}

export default SyncLogger.getTransformableInfo;
