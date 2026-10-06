import { logger } from '../src/utils/logger.js';

describe('Structured Logger Utility', () => {
  it('exposes info, warn, error, and debug methods', () => {
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('runs logger methods without throwing errors', () => {
    expect(() => {
      logger.info('Test information log', { component: 'test-runner' });
      logger.warn('Test warning log', { code: 'TEST_WARN' });
      logger.error('Test error log', { error: 'mock error' });
      logger.debug('Test debug log');
    }).not.toThrow();
  });
});
