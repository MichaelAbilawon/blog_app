const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index"); // Replace with the path to your Express app
const expect = chai.expect;
chai.use(chaiHttp);

describe("User Login", function () {
  this.timeout(10000);

  it("should log in an existing user", function (done) {
    chai
      .request(server)
      .post("/auth/login") // Replace with your login endpoint
      .send({
        email: "user@example.com", // Replace with a valid user's email
        password: "password123", // Replace with the user's password
      })
      .end(function (err, res) {
        expect(res).to.have.status(200); // Assuming 200 is the status code for a successful login
        expect(res.body).to.be.an("object");
        // Add more assertions based on the expected response from a successful login.
        done();
      });
  });

  it("should return an error for invalid credentials", function (done) {
    chai
      .request(server)
      .post("/auth/login") // Replace with your login endpoint
      .send({
        email: "nonexistent@example.com", // Replace with a non-existing user's email
        password: "invalidpassword", // Replace with an invalid password
      })
      .end(function (err, res) {
        expect(res).to.have.status(401); // Assuming 401 is the status code for unauthorized (invalid) login
        expect(res.body).to.be.an("object");
        // Add more assertions based on the expected response for invalid credentials.
        done();
      });
  });

  it("should return an error for missing credentials", function (done) {
    chai
      .request(server)
      .post("/auth/login") // Replace with your login endpoint
      .send({
        // Missing email and password
      })
      .end(function (err, res) {
        expect(res).to.have.status(400); // Assuming 400 is the status code for a bad request
        expect(res.body).to.be.an("object");
        // Add more assertions based on the expected response for missing credentials.
        done();
      });
  });
});
