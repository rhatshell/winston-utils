import _ from 'lodash';
import { TransformableInfo } from 'logform';
import { MESSAGE } from 'triple-beam';
import { formatMetadata, getMetadata, metadata, prettyPrint, prettyPrintMetadata } from '../src';
import { ColorMode, defaultOptions } from '../src/formatters/prettyPrint';
import { getTransformableInfo } from './utils';

interface TransformableInfoWithMetadata extends TransformableInfo {
  meta: any;
}

describe('prettyPrint module', () => {
  describe('formatMetadata', () => {
    it('should produce a formatted json string for an array of elements', () => {
      const data = [{ foo: 'bar' }, { jack: 'jill' }];
      const result = formatMetadata(data);

      expect(typeof result).toBe('string');
    });

    it('should produce a formatted json string for an object', () => {
      const data = { foo: 'bar' };
      const result = formatMetadata(data);

      expect(typeof result).toBe('string');
    });

    it('should produce a formatted string for string', () => {
      const result = formatMetadata('single string arg');

      expect(typeof result).toBe('string');
    });

    it('should produce a formatted string for undefined', () => {
      const result = formatMetadata(undefined);

      expect(result.indexOf('undefined')).toBeGreaterThan(-1);
    });
  });

  describe('getMetadata', () => {
    it('should extract metadata', async () => {
      const expected = [{ foo: 'bar' }, { jack: 'jill' }];
      const info = await getTransformableInfo('test message', { foo: 'bar' }, { jack: 'jill' });
      const actual = getMetadata(info);

      expect(actual).toMatchObject(expected);
    });

    it('should exclude the function callback, if provided', async () => {
      const expected = [{ foo: 'bar' }, { jack: 'jill' }];
      const info = await getTransformableInfo(
        'test message',
        { foo: 'bar' },
        { jack: 'jill' },
        // tslint:disable-next-line: no-empty
        function callback() {},
      );
      const actual = getMetadata(info);

      expect(actual).toMatchObject(expected);
    });

    it('should exclude the fat arrow callback, if provided', async () => {
      const expected = [{ foo: 'bar' }, { jack: 'jill' }];
      // tslint:disable-next-line: no-empty
      const callback = () => {};
      const info = await getTransformableInfo('test message', { foo: 'bar' }, { jack: 'jill' }, callback);
      const { meta } = metadata().transform(info) as TransformableInfoWithMetadata;

      expect(meta).toMatchObject(expected);
    });

    it('should return an empty collection if no extra arguments are passed', async () => {
      const expected = [];
      const info = await getTransformableInfo('test message');
      const { meta } = metadata().transform(info) as TransformableInfoWithMetadata;

      expect(meta).toMatchObject(expected);
    });
  });

  describe('metadata format', () => {
    it('should aggregate logger splat as the meta property', async () => {
      const expected = [{ foo: 'bar' }, { jack: 'jill' }];
      const info = await getTransformableInfo('test message', { foo: 'bar' }, { jack: 'jill' });
      const { meta } = metadata().transform(info) as TransformableInfoWithMetadata;

      expect(meta).toMatchObject(expected);
    });

    it('should aggregate logger splat as the meta property (sans callback function)', async () => {
      const expected = [{ foo: 'bar' }, { jack: 'jill' }];
      // tslint:disable-next-line: no-empty
      const info = await getTransformableInfo('test message', { foo: 'bar' }, { jack: 'jill' }, () => {});
      const { meta } = metadata().transform(info) as TransformableInfoWithMetadata;

      expect(meta).toMatchObject(expected);
    });

    it('should aggregate logger splat as the meta property (no splat)', async () => {
      const expected = [];
      const info = await getTransformableInfo('test message');
      const { meta } = metadata().transform(info) as TransformableInfoWithMetadata;

      expect(meta).toMatchObject(expected);
    });

    it('should aggregate logger splat as the meta property (info object message, no splat)', async () => {
      const expected = [];
      const info = await getTransformableInfo({ foo: 'bar' });
      const { meta } = metadata().transform(info) as TransformableInfoWithMetadata;

      expect(meta).toMatchObject(expected);
    });

    it('should aggregate logger splat as the meta property (no splat, sans callback function)', async () => {
      const expected = [];
      // tslint:disable-next-line: no-empty
      const info = await getTransformableInfo('test message', () => {});
      const { meta } = metadata().transform(info) as TransformableInfoWithMetadata;

      expect(meta).toMatchObject(expected);
    });
  });

  describe('prettyPrintMetadata', () => {
    it('should format as empty string if no supplemental data is passed', async () => {
      const formatter = prettyPrintMetadata();
      const info = await getTransformableInfo('test message');
      const withMetadata = metadata().transform(info);
      const actual = formatter.transform(withMetadata as TransformableInfo) as TransformableInfoWithMetadata;

      expect(actual.meta).toBe('');
    });

    it('should format with color if data is passed', async () => {
      const defaultColor = '\u001b[35m';
      const formatter = prettyPrintMetadata({ colorMode: ColorMode.FULL });
      const info = await getTransformableInfo('test message', 'some', 'additional', { data: 'here' });

      const withMetadata = metadata().transform(info) as TransformableInfoWithMetadata;
      expect(withMetadata.meta.indexOf(defaultColor)).toBe(-1);

      const actual = formatter.transform(withMetadata as TransformableInfo) as TransformableInfoWithMetadata;
      expect(actual.meta.indexOf(defaultColor)).toBeGreaterThan(-1);
    });

    it('should format with color option for meta', async () => {
      const green = '\u001b[32m';
      const formatter = prettyPrintMetadata({
        colorMode: ColorMode.FULL,
        colors: { meta: 'green' },
      });
      const info = await getTransformableInfo('test message', 'some', 'additional', { data: 'here' });
      const withMetadata = metadata().transform(info) as TransformableInfoWithMetadata;
      const actual = formatter.transform(withMetadata as TransformableInfo) as TransformableInfoWithMetadata;

      expect(actual.meta.indexOf(green)).toBeGreaterThan(-1);
    });
  });

  describe('prettyPrint', () => {
    it('should format the entire log message', async () => {
      const expectedSansTimestamp =
        // tslint:disable-next-line: quotemark
        "info: test message\u001b[39m \n\u001b[35m'some'\u001b[39m,\n\u001b[35m'additional'\u001b[39m,\n\u001b[35m{ data: 'here' }\u001b[39m";
      const formatter = prettyPrint({ colorMode: ColorMode.FULL });
      const info = await getTransformableInfo('test message', 'some', 'additional', { data: 'here' });
      const withMetadata = metadata().transform(info) as TransformableInfoWithMetadata;
      const formattedLogMessage = formatter.transform(withMetadata) as TransformableInfo;

      expect(formattedLogMessage).toBeTruthy();
      /**
       * Cannot test this right now because there are subtle differences in formatting between
       * node versions. Rendering is consistent, but additional spaces and escaping quotes varies.
       */
      // expect(formattedLogMessage[MESSAGE].indexOf(expectedSansTimestamp)).toBeGreaterThan(-1);
    });
  });

  describe('defaultOptions', () => {
    it('should produce the default options with no input', () => {
      const {
        colors,
        showHidden,
        depth,
        colorMode,
        compact,
        getters,
        customInspect,
        showProxy,
        maxArrayLength,
        breakLength,
        sorted,
      } = defaultOptions();

      expect(colors).toBeTruthy();
      expect(showHidden).toBe(false);
      expect(depth).toBe(4);
      expect(colorMode).toBe(ColorMode.SPARSE);
      expect(compact).toBe(false);
      expect(getters).toBe(false);
      expect(customInspect).toBe(undefined);
      expect(showProxy).toBe(undefined);
      expect(maxArrayLength).toBe(null);
      expect(breakLength).toBe(undefined);
      expect(sorted).toBe(undefined);
    });

    it('should augment default colors with new values', () => {
      const { colors } = defaultOptions({ colors: { meta: 'green' } });

      expect(colors.meta).toBe('green');
      expect(colors.debug).toBe('blue');
    });

    it('should replace default colors with new values', () => {
      const initial = defaultOptions();
      const actual = defaultOptions({ colors: { info: 'red' } });

      expect(initial.colors.info).toBe('green');
      expect(actual.colors.info).toBe('red');
    });

    it('should remain unchanged if null or undefined is passed for colors', () => {
      const initial = defaultOptions();
      const actual = defaultOptions({ colors: undefined });

      expect(initial.colors.info).toBe('green');
      expect(actual.colors.info).toBe('green');
    });

    it('should replace default values', () => {
      const sortMethod = (a: string, b: string) => {
        return 0;
      };
      const {
        colors,
        showHidden,
        depth,
        colorMode,
        compact,
        getters,
        customInspect,
        showProxy,
        maxArrayLength,
        breakLength,
        sorted,
      } = defaultOptions({
        colors: { meta: 'green' },
        showHidden: true,
        depth: 10,
        colorMode: ColorMode.FULL,
        compact: true,
        getters: true,
        customInspect: true,
        showProxy: true,
        maxArrayLength: 5,
        breakLength: 1,
        sorted: sortMethod,
      });

      expect(colors.meta).toBe('green');
      expect(showHidden).toBe(true);
      expect(depth).toBe(10);
      expect(colorMode).toBe(ColorMode.FULL);
      expect(compact).toBe(true);
      expect(getters).toBe(true);
      expect(customInspect).toBe(true);
      expect(showProxy).toBe(true);
      expect(maxArrayLength).toBe(5);
      expect(breakLength).toBe(1);
      expect(sorted).toBe(sortMethod);
    });
  });
});
