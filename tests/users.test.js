jest.mock("fs", () => ({
  writeFile: jest.fn(),
}));

const request = require("supertest");

describe("Users API", () => {
  let server;
  let fs;

  beforeEach(() => {
    jest.resetModules();
    fs = require("fs");
    fs.writeFile.mockReset();
    server = require("../server");
  });

  describe("GET /users", () => {
    test("should return all users", async () => {
      const res = await request(server).get("/users");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /users/:id", () => {
    test("should return 404 when user does not exist", async () => {
      const res = await request(server).get("/users/does-not-exist");

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("User not found.");
    });
  });

  describe("POST /users", () => {
    test("should return 400 if required fields are missing", async () => {
      const res = await request(server).post("/users").send({
        id: "123",
        username: "keenan",
      });

      expect(res.statusCode).toBe(400);
      expect(res.text).toBe(
        "'id', 'username', and 'passwordHash' fields are required.",
      );
    });

    test("should create a user when all required fields are present", async () => {
      fs.writeFile.mockImplementation((filePath, data, callback) =>
        callback(null),
      );

      const res = await request(server).post("/users").send({
        id: "test-user-1",
        username: "keenan",
        passwordHash: "hashed-password",
      });

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("keenan has been successfully added");
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
    });

    test("should return 500 if file write fails", async () => {
      fs.writeFile.mockImplementation((filePath, data, callback) =>
        callback(new Error("write failed")),
      );

      const res = await request(server).post("/users").send({
        id: "test-user-2",
        username: "failcase",
        passwordHash: "hashed-password",
      });

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe("Failed to save user");
    });
  });

  describe("PATCH /users/:id", () => {
    test("should return 404 if user does not exist", async () => {
      const res = await request(server)
        .patch("/users/does-not-exist")
        .send({ username: "updated-name" });

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("User not found.");
    });

    test("should update an existing user", async () => {
      fs.writeFile.mockImplementation((filePath, data, callback) =>
        callback(null),
      );

      await request(server).post("/users").send({
        id: "update-user-1",
        username: "oldname",
        passwordHash: "hash1",
      });

      const res = await request(server)
        .patch("/users/update-user-1")
        .send({ username: "newname" });

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("oldname has been successfully updated.");
    });
  });

  describe("DELETE /users/:id", () => {
    test("should return 404 if user does not exist", async () => {
      const res = await request(server).delete("/users/does-not-exist");

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("User not found");
    });

    test("should delete an existing user", async () => {
      fs.writeFile.mockImplementation((filePath, data, callback) =>
        callback(null),
      );

      await request(server).post("/users").send({
        id: "delete-user-1",
        username: "deleteme",
        passwordHash: "hash1",
      });

      const res = await request(server).delete("/users/delete-user-1");

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("deleteme has been successfully deleted");
    });
  });
});
