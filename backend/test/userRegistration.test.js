const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
const expect = chai.expect;
chai.use(chaiHttp);
require("dotenv").config();
const mongoose = require("mongoose");

describe("User Registration", function () {
  this.timeout(10000);
  it("should register a new user", function (done) {
    chai
      .request(server)
      .post("/auth/register")
      .send({
        firstname: "John",
        lastname: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      })
      .end(function (err, res) {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an("object");
        // expect(res.body.message).to.equal("User registered successfully");
        done();
      });
  });

  it("should return an error for duplicate email", function (done) {
    chai
      .request(server)
      .post("/auth/register")
      .send({
        firstname: "Jane",
        lastname: "Doe",
        email: "johndoe@example.com", // Duplicate email
        password: "password123",
      })
      .end(function (err, res) {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an("object");
        // expect(res.body.error).to.equal("Email is already in use");
        done();
      });
  });

  it("should return an error for incomplete data", function (done) {
    chai
      .request(server)
      .post("/auth/register")
      .send({
        // Incomplete data, missing password
        firstname: "Alice",
        lastname: "Smith",
        email: "alicesmith@example.com",
      })
      .end(function (err, res) {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an("object");
        // expect(res.body.error).to.equal("Validation failed");
        done();
      });
  });
});
