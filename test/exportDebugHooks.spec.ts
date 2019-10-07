import _ from 'lodash';
import { createLogger, format, transports } from 'winston';
import { exportDebugHooks, Levels, prettyPrint } from '../src';
import { ColorMode, defaultOptions, PRETTY_PRINT_FORMAT_NAME } from '../src/formatters/prettyPrint';

describe('exportDebugHooks', () => {
  beforeEach(() => {
    delete window.setLogLevel;
    delete window.levels;
  });

  it('should expose debug hooks to global namespace', () => {
    const logger = createLogger();
    expect(window.setLogLevel).toBeUndefined();
    expect(window.levels).toBeUndefined();

    exportDebugHooks(logger);

    expect(window.setLogLevel).toBeTruthy();
    expect(window.levels).toBeTruthy();
  });

  it('should expose debug hooks to specified namespace', () => {
    const logger = createLogger();
    expect(_.get(window, 'path.to.safe.space.setLogLevel')).toBeUndefined();
    expect(_.get(window, 'path.to.safe.space.levels')).toBeUndefined();

    exportDebugHooks(logger, 'path.to.safe.space');

    expect((window as any).path.to.safe.space.setLogLevel).toBeTruthy();
    expect((window as any).path.to.safe.space.levels).toBeTruthy();
  });

  describe('applyConfig', () => {
    it('should replace the prettyPrint formatter', () => {
      const initialConfig = defaultOptions();
      const initialFormat = prettyPrint();
      const transport = new transports.Console({
        format: initialFormat,
      });
      const logger = createLogger({
        level: Levels.error,
        transports: [transport],
      });
      exportDebugHooks(logger);

      expect(transport.format).toEqual(initialFormat);
      expect(transport.format.options).toMatchObject(initialConfig);

      const expectedConfig = { ...initialConfig, depth: 10, colorMode: ColorMode.FULL };
      const updatedConfig = window.applyConfig({ depth: 10, colorMode: ColorMode.FULL });

      expect(updatedConfig).toMatchObject(expectedConfig);
      expect(transport.format).not.toEqual(initialFormat);
    });

    it('should have no impact if prettyPrint format not found', () => {
      const initialFormat = format.json();
      const transport = new transports.Console({
        format: initialFormat,
      });
      const logger = createLogger({
        level: Levels.error,
        transports: [transport],
      });
      exportDebugHooks(logger);

      const message = window.applyConfig({ depth: 10, colorMode: ColorMode.FULL });

      expect(message).toBe(`Transport not found ${PRETTY_PRINT_FORMAT_NAME}`);
      expect(transport.format).toEqual(initialFormat);
    });
  });

  describe('setLogLevel', () => {
    it('should set the level on the logger', () => {
      const logger = createLogger({
        level: Levels.error,
        transports: [
          new transports.Console({
            format: format.json(),
          }),
        ],
      });
      exportDebugHooks(logger);

      expect(logger.level).toBe(Levels.error);
      window.setLogLevel(Levels.warn);
      expect(logger.level).toBe(Levels.warn);
    });

    it('should leave the log level alone when passed invalid levels', () => {
      const logger = createLogger({
        level: Levels.error,
        transports: [
          new transports.Console({
            format: format.json(),
          }),
        ],
      });
      exportDebugHooks(logger);

      window.setLogLevel(undefined);
      expect(logger.level).toBe(Levels.error);
    });
  });
});
