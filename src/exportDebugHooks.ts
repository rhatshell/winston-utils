import _ from 'lodash';
import { Logger } from 'winston';
import { ColorMode, PRETTY_PRINT_FORMAT_NAME, prettyPrint } from './formatters';
import { LogLevels, PrettyPrintOptions } from './interfaces';
import { Levels } from './Levels';

declare global {
  export interface Window {
    applyConfig: (opts: PrettyPrintOptions) => void;
    colorMode: ColorMode;
    levels: LogLevels;
    setLogLevel: (level: string) => void;
  }
}

/**
 * exposes setLogLevel function and Levels for live debugging and troubleshooting
 * WARNING: Default path is window so this call will pollute the global namespace!
 *
 * @param logger Logger instance to use
 * @param path Place to hang exported items
 */
export const exportDebugHooks = (logger: Logger, path?: string) => {
  const applyConfigPath = path ? `${path}.applyConfig` : 'applyConfig';
  const colorModePath = path ? `${path}.colorMode` : 'colorMode';
  const levelsPath = path ? `${path}.levels` : 'levels';
  const setLogLevelPath = path ? `${path}.setLogLevel` : 'setLogLevel';

  const applyConfig = (opts: PrettyPrintOptions) => {
    const transport = logger.transports.find(item => _.get(item, 'format.name') === PRETTY_PRINT_FORMAT_NAME);
    if (transport) {
      transport.format = prettyPrint({
        ...transport.format.options,
        ...opts,
      });

      return transport.format.options;
    }
    return `Transport not found ${PRETTY_PRINT_FORMAT_NAME}`;
  };

  const setLogLevel = (level: string) => {
    if (_.hasIn(Levels, level)) {
      logger.level = level;
      return `Log level set ${_.toUpper(level)}`;
    }
    return `Invalid level ${level}`;
  };

  _.set(window, applyConfigPath, applyConfig);
  _.set(window, colorModePath, ColorMode);
  _.set(window, levelsPath, Levels);
  _.set(window, setLogLevelPath, setLogLevel);
};
