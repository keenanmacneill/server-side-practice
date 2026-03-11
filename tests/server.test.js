const request = require("supertest");
const server = require("../server");

describe("Server", () => {
  test("GET / responds with 200 and health message", async () => {
    const res = await request(server).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("API is running");
  });

  test("GET /users responds with JSON array", async () => {
    const res = await request(server).get("/users");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /notes responds with JSON array", async () => {
    const res = await request(server).get("/notes");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET unknown route responds with 404", async () => {
    const res = await request(server).get("/not-a-real-route");

    expect(res.statusCode).toBe(404);
  });

  test("PUT /users responds with 404 when method is not defined", async () => {
    const res = await request(server).put("/users");

    expect(res.statusCode).toBe(404);
  });

  test("POST /users responds with 400 for malformed JSON", async () => {
    const res = await request(server)
      .post("/users")
      .set("Content-Type", "application/json")
      .send('{"badJson": }');

    expect(res.statusCode).toBe(400);
  });
});
