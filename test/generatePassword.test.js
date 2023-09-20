// import assert from "assert";
// import generateNewPassword from "../services/generatePassword.js";
// import pgPromise from "pg-promise";
// import "dotenv/config";

// const pgp = pgPromise();
// const connectionString = process.env.DATABASE_URL_TEST;
// const database = pgp(connectionString);

// const logic = generateNewPassword(database);

// describe("new password unit testing", () => {
//   it("should be able to retrieve data for a registered usernames", async () => {
//     assert.deepStrictEqual(
//       { waiter_id: 1, waiter_name: "mthunzi", password: "" },
//       logic.getRegisteredWaiter("mthunzi")
//     );
//   });
//   it("should be able to update a password for a registered username", async () => {
//     assert.deepStrictEqual(
//       { password: "" },
//       logic.getPassword({
//         name: "mthunzi",
//       })
//     );
//     assert.deepStrictEqual(
//       { password: "" },
//       logic.updatePassword({
//         name: "mthunzi",
//         password: 12345,
//       })
//     );
//   });
// });
