import { PrettyPrintOptions } from '@interfaces/PrettyPrintOptions';
import _ from 'lodash';
import { format, Format, TransformableInfo } from 'logform';
import { SPLAT } from 'triple-beam';
import { inspect } from 'util';
import { PRETTY_PRINT_FORMAT_NAME } from '.';
import { ColorMode } from './ColorMode';
import { defaultOptions } from './defaultOptions';

const { combine, timestamp, printf } = format;
const colorizerFactory = (opts?: PrettyPrintOptions) => {
  return format.colorize({ colors: _.get(opts, 'colors') });
};
let colorizer = colorizerFactory();
const toFormattedJson = (msg: any, opts?: PrettyPrintOptions) => {
  if (!msg) {
    return String(msg);
  }

  const colorMode = _.get(opts, 'colorMode');
  const formatted = inspect(msg, { ...opts, colors: colorMode === ColorMode.SPARSE });
  if (colorMode === ColorMode.FULL) {
    return colorizer.colorize('meta', formatted);
  }
  return formatted;
};

export const formatMetadata = (meta: any, opts?: PrettyPrintOptions): string => {
  if (_.isArray(meta)) {
    return _.map(meta, item => `\n${toFormattedJson(item, opts)}`).join(',');
  } else if (_.isObjectLike(meta)) {
    return `\n${toFormattedJson(meta, opts)}`;
  } else {
    return toFormattedJson(meta, opts);
  }
};

export const getMetadata = (info: TransformableInfo) => {
  const symbol = Object.getOwnPropertySymbols(info).find(sym => sym === SPLAT);
  const splat: any[] = _.get(info, symbol);
  if (_.isFunction(_.last(splat))) {
    return splat.splice(0, splat.length - 1);
  }
  return splat || [];
};

export const metadata = (): Format => {
  return {
    options: undefined,
    transform: (info: TransformableInfo): TransformableInfo => {
      const meta = getMetadata(info);
      return {
        ...info,
        meta,
      };
    },
  };
};

export const prettyPrintMetadata = (opts?: PrettyPrintOptions): Format => {
  const options = defaultOptions(opts);
  colorizer = colorizerFactory(options);
  return {
    options,
    transform: (info: TransformableInfo) => {
      const meta = info.meta ? info.meta : getMetadata(info);
      return {
        ...info,
        meta: formatMetadata(meta, options),
      };
    },
  };
};

export const prettyPrint = (opts?: PrettyPrintOptions) => {
  const options = defaultOptions(opts);
  colorizer = colorizerFactory(options);
  const { transform } = combine(
    timestamp(),
    prettyPrintMetadata(options),
    printf(info => {
      // tslint:disable-next-line: no-shadowed-variable
      const { message, meta, level, timestamp } = info;

      const header = `${timestamp} ${level}: ${message}`;
      return `${options.colorMode ? colorizer.colorize(level, header) : header} ${meta}`;
    }),
  );
  return {
    options,
    transform,
    get name() {
      return PRETTY_PRINT_FORMAT_NAME;
    },
  };
};
