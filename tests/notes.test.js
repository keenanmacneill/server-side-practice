jest.mock("fs", () => ({
  writeFile: jest.fn(),
}));

const request = require("supertest");

describe("Notes API", () => {
  let server;
  let fs;

  beforeEach(() => {
    jest.resetModules();
    fs = require("fs");
    fs.writeFile.mockReset();
    server = require("../server");
  });

  describe("GET /notes", () => {
    test("should return all notes", async () => {
      const res = await request(server).get("/notes");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /notes/:id", () => {
    test("should return 404 when note does not exist", async () => {
      const res = await request(server).get("/notes/does-not-exist");

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("Note not found.");
    });
  });

  describe("POST /notes", () => {
    test("should return 400 if required fields are missing", async () => {
      const res = await request(server).post("/notes").send({
        id: "note-1",
        title: "Test title",
      });

      expect(res.statusCode).toBe(400);
      expect(res.text).toBe("All fields must be completed.");
    });

    test("should create a note when all fields are present", async () => {
      fs.writeFile.mockImplementation((filePath, data, callback) =>
        callback(null),
      );

      const res = await request(server).post("/notes").send({
        id: "note-1",
        title: "Test note",
        content: "This is a test note",
        location: "Laptop",
        userId: "user-1",
      });

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe(
        "'Test note' at Laptop has been successfully added.",
      );
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
    });

    test("should return 500 if file write fails", async () => {
      fs.writeFile.mockImplementation((filePath, data, callback) =>
        callback(new Error("write failed")),
      );

      const res = await request(server).post("/notes").send({
        id: "note-2",
        title: "Broken note",
        content: "This should fail",
        location: "Desk",
        userId: "user-2",
      });

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe("Failed to save note");
    });
  });

  describe("PATCH /notes/:id", () => {
    test("should return 404 if note does not exist", async () => {
      const res = await request(server)
        .patch("/notes/does-not-exist")
        .send({ title: "Updated title" });

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("Note not found.");
    });

    test("should update an existing note", async () => {
      fs.writeFile.mockImplementation((filePath, data, callback) =>
        callback(null),
      );

      await request(server).post("/notes").send({
        id: "note-update-1",
        title: "Old title",
        content: "Old content",
        location: "Home",
        userId: "user-1",
      });

      const res = await request(server)
        .patch("/notes/note-update-1")
        .send({ title: "New title" });

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Successfully updated New title at Home");
    });
  });

  describe("DELETE /notes/:id", () => {
    test("should return 404 if note does not exist", async () => {
      const res = await request(server).delete("/notes/does-not-exist");

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("Note not found");
    });

    test("should delete an existing note", async () => {
      fs.writeFile.mockImplementation((filePath, data, callback) =>
        callback(null),
      );

      await request(server).post("/notes").send({
        id: "note-delete-1",
        title: "Delete me",
        content: "content",
        location: "Desk",
        userId: "user-1",
      });

      const res = await request(server).delete("/notes/note-delete-1");

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("'Delete me' at Desk was successfully deleted");
    });
  });
});
