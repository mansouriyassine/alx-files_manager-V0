const assert = require('assert');
const { redisClient } = require('../utils/redis');

describe('Redis Client', function () {
  before(function () {
    // Clear any existing data in Redis
    redisClient.flushall();
  });

  it('should set and get a value from Redis', async function () {
    await redisClient.set('testKey', 'testValue');
    const value = await redisClient.get('testKey');
    assert.strictEqual(value, 'testValue');
  });

  it('should return null for non-existing key', async function () {
    const value = await redisClient.get('nonExistingKey');
    assert.strictEqual(value, null);
  });

  after(function () {
    // Clean up after all tests
    redisClient.quit();
  });
});
