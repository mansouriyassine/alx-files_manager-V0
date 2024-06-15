const assert = require('assert');
const request = require('supertest');
const app = require('../app');

describe('Endpoints', function () {
  let token = '';

  // Retrieve token before starting tests
  before(async function () {
    const response = await request(app)
      .get('/connect')
      .auth('bob@dylan.com', 'toto1234!');
    token = response.body.token;
  });

  // GET /status
  describe('GET /status', function () {
    it('should return status 200', async function () {
      const response = await request(app).get('/status');
      assert.strictEqual(response.status, 200);
    });
  });

  // GET /stats
  describe('GET /stats', function () {
    it('should return status 200', async function () {
      const response = await request(app).get('/stats');
      assert.strictEqual(response.status, 200);
    });
  });

  // POST /users
  describe('POST /users', function () {
    it('should create a new user and return status 201', async function () {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'newuser@example.com',
          password: 'password123'
        });
      assert.strictEqual(response.status, 201);
    });
  });

  // GET /connect
  describe('GET /connect', function () {
    it('should return status 200 and a token', async function () {
      const response = await request(app)
        .get('/connect')
        .auth('bob@dylan.com', 'toto1234!');
      assert.strictEqual(response.status, 200);
      assert.ok(response.body.token);
    });
  });

  // GET /disconnect
  describe('GET /disconnect', function () {
    it('should return status 204', async function () {
      const response = await request(app)
        .get('/disconnect')
        .set('X-Token', token);
      assert.strictEqual(response.status, 204);
    });
  });

  // GET /users/me
  describe('GET /users/me', function () {
    it('should return status 200 and user data', async function () {
      const response = await request(app)
        .get('/users/me')
        .set('X-Token', token);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.email, 'bob@dylan.com');
    });
  });

  // POST /files
  describe('POST /files', function () {
    it('should upload a file and return status 201', async function () {
      // Mock file upload
      const fileData = Buffer.from('test file data');
      const response = await request(app)
        .post('/files')
        .set('X-Token', token)
        .attach('file', fileData, 'testfile.txt');
      assert.strictEqual(response.status, 201);
    });
  });

  // GET /files/:id
  describe('GET /files/:id', function () {
    let fileId = '';

    before(async function () {
      // Upload a file to get its ID
      const fileData = Buffer.from('test file data');
      const response = await request(app)
        .post('/files')
        .set('X-Token', token)
        .attach('file', fileData, 'testfile.txt');
      fileId = response.body.id;
    });

    it('should return status 200 and file data', async function () {
      const response = await request(app)
        .get(`/files/${fileId}`)
        .set('X-Token', token);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.name, 'testfile.txt');
    });
  });

  // GET /files (pagination)
  describe('GET /files', function () {
    it('should return status 200 and files with pagination', async function () {
      const response = await request(app)
        .get('/files')
        .set('X-Token', token)
        .query({ page: 0 });
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.length, 20); // Assuming pagination is set to 20 per page
    });
  });

  // PUT /files/:id/publish
  describe('PUT /files/:id/publish', function () {
    let fileId = '';

    before(async function () {
      // Upload a file to get its ID
      const fileData = Buffer.from('test file data');
      const response = await request(app)
        .post('/files')
        .set('X-Token', token)
        .attach('file', fileData, 'testfile.txt');
      fileId = response.body.id;
    });

    it('should publish a file and return status 200', async function () {
      const response = await request(app)
        .put(`/files/${fileId}/publish`)
        .set('X-Token', token);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.isPublic, true);
    });
  });

  // PUT /files/:id/unpublish
  describe('PUT /files/:id/unpublish', function () {
    let fileId = '';

    before(async function () {
      // Upload a file to get its ID
      const fileData = Buffer.from('test file data');
      const response = await request(app)
        .post('/files')
        .set('X-Token', token)
        .attach('file', fileData, 'testfile.txt');
      fileId = response.body.id;

      // Publish the file
      await request(app)
        .put(`/files/${fileId}/publish`)
        .set('X-Token', token);
    });

    it('should unpublish a file and return status 200', async function () {
      const response = await request(app)
        .put(`/files/${fileId}/unpublish`)
        .set('X-Token', token);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.isPublic, false);
    });
  });

  // GET /files/:id/data
  describe('GET /files/:id/data', function () {
    let fileId = '';

    before(async function () {
      // Upload a file to get its ID
      const fileData = Buffer.from('test file data');
      const response = await request(app)
        .post('/files')
        .set('X-Token', token)
        .attach('file', fileData, 'testfile.txt');
      fileId = response.body.id;
    });

    it('should return file data and status 200', async function () {
      const response = await request(app)
        .get(`/files/${fileId}/data`)
        .set('X-Token', token);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.toString(), 'test file data');
    });

    it('should return resized file data based on size query param', async function () {
      const response = await request(app)
        .get(`/files/${fileId}/data`)
        .set('X-Token', token)
        .query({ size: 100 });
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.toString(), 'test file data');
    });
  });

  after(function () {
    // Clean up after all tests
    request(app).get('/disconnect').set('X-Token', token);
  });
});
