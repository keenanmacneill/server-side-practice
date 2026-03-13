const request = require('supertest');
const fs = require('fs');

let server;
let writeSpy;
let appendSpy;
let unlinkSpy;

describe('Users API', () => {
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

  describe('GET /users', () => {
    test('should return all users', async () => {
      const res = await request(server).get('/users');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /users/:id', () => {
    test('should return 404 when user does not exist', async () => {
      const res = await request(server).get('/users/does-not-exist');

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe('User not found.');
    });
  });

  describe('POST /users', () => {
    test('should return 400 if required fields are missing', async () => {
      const res = await request(server).post('/users').send({
        id: '123',
        username: 'keenan',
      });

      expect(res.statusCode).toBe(400);
      expect(res.text).toBe("'id', 'username', and 'password' fields are required.");
    });

    test('should create a user when all required fields are present', async () => {
      const res = await request(server).post('/users').send({
        id: '100',
        username: 'keenan',
        password: 'hashed-password',
      });

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('keenan has been successfully added');
      expect(writeSpy).toHaveBeenCalledTimes(1);
    });

    test('should return 500 if file write fails', async () => {
      writeSpy.mockImplementationOnce((filePath, data, callback) => {
        callback(new Error('write failed'));
      });

      const res = await request(server).post('/users').send({
        id: 'test-user-2',
        username: 'failcase',
        password: 'hashed-password',
      });

      expect(res.statusCode).toBe(500);
    });
  });

  describe('PATCH /users/:id', () => {
    test('should return 404 if user does not exist', async () => {
      const res = await request(server)
        .patch('/users/does-not-exist')
        .send({ username: 'updated-name' });

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe('User not found.');
    });

    test('should update an existing user', async () => {
      const res = await request(server).patch('/users/1').send({ username: 'newname' });

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('Successfully updated.');
    });
  });

  describe('DELETE /users/:id', () => {
    test('should return 404 if user does not exist', async () => {
      const res = await request(server).delete('/users/does-not-exist');

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe('User not found');
    });

    test('should delete an existing user', async () => {
      const res = await request(server).delete('/users/1');

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('alice has been successfully deleted');
    });
  });
});
