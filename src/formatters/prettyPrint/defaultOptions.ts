import { PrettyPrintOptions } from '@interfaces/PrettyPrintOptions';
import _ from 'lodash';
import { ColorMode } from './ColorMode';

const defaultColors = {
  meta: 'magenta',
  alert: 'yellow',
  crit: 'red',
  data: 'grey',
  debug: 'blue',
  emerg: 'red',
  error: 'red',
  help: 'cyan',
  http: 'green',
  info: 'green',
  input: 'grey',
  notice: 'yellow',
  prompt: 'grey',
  silly: 'magenta',
  verbose: 'cyan',
  warn: 'yellow',
  warning: 'red',
};

const defaultPrettyPrintOptions: PrettyPrintOptions = {
  colors: defaultColors,
  showHidden: false,
  depth: 4,
  colorMode: ColorMode.SPARSE,
  compact: false,
  getters: false,
  maxArrayLength: null,
};

export const defaultOptions = (opts?: PrettyPrintOptions) => {
  return _.defaultsDeep({}, opts, defaultPrettyPrintOptions);
};
