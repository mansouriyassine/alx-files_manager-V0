const assert = require('assert');
const { dbClient } = require('../utils/db');

describe('MongoDB Client', function () {
  it('should connect to the database', async function () {
    const isConnected = await dbClient.isConnected();
    assert.strictEqual(isConnected, true);
  });

  it('should fetch user data from database', async function () {
    const users = await dbClient.getAllUsers();
    assert.strictEqual(users.length > 0, true);
  });

  after(function () {
    // Clean up after all tests
    dbClient.close();
  });
});
