const request = require('supertest');
const fs = require('fs');

let server;
let writeSpy;
let appendSpy;
let unlinkSpy;

describe('Notes API', () => {
  beforeEach(() => {
    jest.resetModules();

    jest.doMock('../data/notesData.json', () => [
      { id: '1', title: 'alice', content: 'hash1', location: 'somewhere', userId: '1' },
      { id: '2', title: 'billy', content: 'hash2', location: 'somewhere-else', userId: '2' },
    ]);

    jest.doMock('../middleware/requireAuth', () => (req, res, next) => next());

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
    jest.dontMock('../data/notesData.json');
  });

  describe('GET /notes', () => {
    test('should return all notes', async () => {
      const res = await request(server).get('/notes');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /notes/:id', () => {
    test('should return 404 when note does not exist', async () => {
      const res = await request(server).get('/notes/does-not-exist');

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe('Note not found.');
    });
  });

  describe('POST /notes', () => {
    test('should return 400 if required fields are missing', async () => {
      const res = await request(server).post('/notes').send({
        id: '3',
        title: 'Test title',
      });

      expect(res.statusCode).toBe(400);
      expect(res.text).toBe('All fields must be completed.');
    });

    test('should create a note when all fields are present', async () => {
      const res = await request(server).post('/notes').send({
        id: 'note-1',
        title: 'Test note',
        content: 'This is a test note',
        location: 'Laptop',
        userId: 'user-1',
      });

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("'Test note' at Laptop has been successfully added.");
      expect(writeSpy).toHaveBeenCalledTimes(1);
    });

    test('should return 500 if file write fails', async () => {
      writeSpy.mockImplementation((filePath, data, callback) =>
        callback(new Error('write failed')),
      );

      const res = await request(server).post('/notes').send({
        id: 'note-2',
        title: 'Broken note',
        content: 'This should fail',
        location: 'Desk',
        userId: 'user-2',
      });

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Failed to save note');
    });
  });

  describe('PATCH /notes/:id', () => {
    test('should return 404 if note does not exist', async () => {
      const res = await request(server)
        .patch('/notes/does-not-exist')
        .send({ title: 'Updated title' });

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe('Note not found.');
    });

    test('should update an existing note', async () => {
      writeSpy.mockImplementation((filePath, data, callback) => callback(null));

      const res = await request(server).patch('/notes/1').send({ title: 'New title' });

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('Successfully updated New title at somewhere');
    });
  });

  describe('DELETE /notes/:id', () => {
    test('should return 404 if note does not exist', async () => {
      const res = await request(server).delete('/notes/does-not-exist');

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe('Note not found');
    });

    test('should delete an existing note', async () => {
      writeSpy.mockImplementation((filePath, data, callback) => callback(null));

      const res = await request(server).delete('/notes/1');

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("'alice' at somewhere was successfully deleted");
    });
  });
});
