const request = require("supertest");
const server = require("../server");

describe("GET /", () => {
  test("returns API is running", async () => {
    const res = await request(server).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("API is running");
  });
});

describe("Server", () => {
  test("GET /users should respond with 200", async () => {
    const res = await request(server).get("/users");

    expect(res.statusCode).toBe(200);
  });

  test("GET /notes should respond with 200", async () => {
    const res = await request(server).get("/notes");

    expect(res.statusCode).toBe(200);
  });
});

describe("Users routes", () => {
  test("GET /users returns an array", async () => {
    const res = await request(server).get("/users");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("Notes routes", () => {
  test("GET /notes returns an array", async () => {
    const res = await request(server).get("/notes");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
