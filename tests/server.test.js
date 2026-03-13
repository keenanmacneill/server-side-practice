const request = require('supertest');
const fs = require('fs');

let server;
let writeSpy;
let appendSpy;
let unlinkSpy;

describe('Server', () => {
  beforeEach(() => {
    jest.resetModules();

    jest.doMock('../data/usersData.json', () => [
      { id: '1', username: 'alice', password: 'hash1' },
      { id: '2', username: 'bob', password: 'hash2' },
    ]);

    writeSpy = jest.spyOn(fs, 'writeFile').mockImplementation((filePath, data, callback) => {
      if (callback) callback(null);
    });

    appendSpy = jest.spyOn(fs, 'appendFile').mockImplementation((filePath, data, callback) => {
      if (callback) callback(null);
    });

    unlinkSpy = jest.spyOn(fs, 'unlink').mockImplementation((filePath, callback) => {
      if (callback) callback(null);
    });

    server = require('../server');
  });

  afterEach(() => {
    writeSpy.mockRestore();
    appendSpy.mockRestore();
    unlinkSpy.mockRestore();
    jest.dontMock('../data/usersData.json');
  });

  test('GET / responds with 200 and health message', async () => {
    const res = await request(server).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('API is running');
  });

  test('GET /users responds with JSON array', async () => {
    const res = await request(server).get('/users');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /notes responds with JSON array', async () => {
    const res = await request(server).get('/notes');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET unknown route responds with 404', async () => {
    const res = await request(server).get('/not-a-real-route');

    expect(res.statusCode).toBe(404);
  });

  test('PUT /users responds with 404 when method is not defined', async () => {
    const res = await request(server).put('/users');

    expect(res.statusCode).toBe(404);
  });

  test('POST /users responds with 400 for malformed JSON', async () => {
    const res = await request(server)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send('{"badJson": }');

    expect(res.statusCode).toBe(400);
  });
});
