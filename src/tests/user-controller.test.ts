import request from "supertest";

import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe("UsersController", () => {
  let user_id: string;

  afterAll(async () => {
    if (user_id) {
      await prisma.user.delete({ where: { id: user_id } });
    }

    // Fecha a conexão para evitar o travamento ("failed to exit gracefully")
    await prisma.$disconnect();
  });

  it("should create a new user successfully", async () => {
    const response = await request(app).post("/users").send({
      name: "test user",
      email: "testuser@email.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("test user");

    user_id = response.body.id;
  });

  it("should throw an error if user with same email already exists", async () => {
    const response = await request(app).post("/users").send({
      name: "duplicate user",
      email: "testuser@email.com",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("user with same email already exists");
  });

  it("should throw a validation error if email is invalid", async () => {
    const response = await request(app).post("/users").send({
      name: "test user",
      email: "invalid-email",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("validation error");
  });
});
