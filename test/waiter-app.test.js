import assert from "assert";
import waitersApp from "../services/waiterApp.js";
import WaiterRegistration from "../services/waiterRegistration.js";
import pgPromise from "pg-promise";
import "dotenv/config";

// bcrypt import
import bcrypt from "bcrypt";

const pgp = pgPromise();
const connectionString = process.env.DATABASE_URL_TEST;
const database = pgp(connectionString);

// services imports
const WaitersApp = waitersApp(database);
const waiterRegistration = WaiterRegistration(database);

describe("waiters app", function () {
  this.timeout(10000);

  beforeEach(async () => {
    try {
      await database.none(
        "TRUNCATE TABLE waiter_registration RESTART IDENTITY CASCADE"
      );
      await database.none(
        "TRUNCATE TABLE availability RESTART IDENTITY CASCADE"
      );

      // admin registration into the app code below:
      const saltRounds = 10;
      const password = "1262";
      const name = "tom";

      const hash = await bcrypt.hash(password, saltRounds);
      // Store the 'hash' in your password database or use it as needed
      const waiterSignUp = {
        name,
        hash,
      };

      // inserting the admin into the workers table
      await database.none(
        `insert into waiter_registration (waiter_name, password, role) values ('${waiterSignUp.name}', '${waiterSignUp.hash}', 'admin')`
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  try {
    it("should be able to get the days of the week", async () => {
      const daysOfTheWeek = await WaitersApp.weekDays();
      assert.deepStrictEqual(
        [
          {
            day: "monday",
          },
          {
            day: "tuesday",
          },
          {
            day: "wednesday",
          },
          {
            day: "thursday",
          },
          {
            day: "friday",
          },
          {
            day: "saturday",
          },
          {
            day: "sunday",
          },
        ],
        daysOfTheWeek
      );
    });
  } catch (error) {
    console.log(error);
    throw error;
  }

  describe("waiters", () => {
    try {
      it("should be able to register, retrieve a waiter and hashed password", async () => {
        const saltRounds = 10;
        const password = "1234";
        const name = "tim";

        // bcrypt the password from the user
        const hash = await bcrypt.hash(password, saltRounds);
        // Store the 'hash' in your password database or use it as needed
        const waiterSignUp = {
          name,
          hash,
        };
        // insert waiter into the waiter_registration database
        await waiterRegistration.registerWaiter(waiterSignUp);

        // retrieve data in the waiter_registration database
        const waiterRetrieval = await database.oneOrNone(
          `select * from waiter_registration where role = 'waiter'`
        );

        assert.deepStrictEqual(
          {
            waiter_id: 2,
            waiter_name: "tim",
            password: waiterSignUp.hash,
            role: "waiter",
          },
          waiterRetrieval
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should be able to register, retrieve another waiter and hashed password", async () => {
        const saltRounds = 10;
        const password = "1262";
        const name = "bjorn";

        const hash = await bcrypt.hash(password, saltRounds);
        // Store the 'hash' in your password database or use it as needed
        const waiterSignUp = {
          name,
          hash,
        };
        // insert waiter into the waiter_registration database
        await waiterRegistration.registerWaiter(waiterSignUp);

        // retrieve data in the waiter_registration database
        const waiterRetrieval = await database.oneOrNone(
          `select * from waiter_registration where role = 'waiter'`
        );

        assert.deepStrictEqual(
          {
            waiter_id: 2,
            waiter_name: "bjorn",
            password: waiterSignUp.hash,
            role: "waiter",
          },
          waiterRetrieval
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    // try {
    //   it("should be able to insert a waiter once and retrieve one waiter", async () => {
    //     await WaitersApp.insertWaiter({
    //       emailOrName: "bjorn",
    //     });
    //     await WaitersApp.insertWaiter({
    //       emailOrName: "bjorn",
    //     });
    //     const waiterRetrieval = await database.oneOrNone(
    //       `select waiter_name from workers where role = 'waiter'`
    //     );
    //     assert.deepStrictEqual({ waiter_name: "bjorn" }, waiterRetrieval);
    //   });
    // } catch (error) {
    //   console.log(error);
    //   throw error;
    // }

    // try {
    //   it("should be able to select and view the selected days to work on", async () => {
    //     await WaitersApp.insertWaiter({
    //       emailOrName: "kat",
    //     });
    //     await WaitersApp.setWaiterId("kat");
    //     await WaitersApp.selectShift(["monday", "tuesday", "thursday"]);
    //     assert.deepStrictEqual(
    //       [
    //         { waiter_name: "kat", day: "monday" },
    //         { waiter_name: "kat", day: "tuesday" },
    //         { waiter_name: "kat", day: "thursday" },
    //       ],
    //       await WaitersApp.availableWaiters()
    //     );
    //   });
    // } catch (error) {
    //   console.log(error);
    //   throw error;
    // }

    try {
      it("should not be able to show the selected days when selected days are less than 3 days", async () => {
        const saltRounds = 10;
        const password = "1262";
        const name = "bjorn";

        const hash = await bcrypt.hash(password, saltRounds);
        // Store the 'hash' in your password database or use it as needed
        const waiterSignUp = {
          name,
          hash,
        };
        // insert waiter into the waiter_registration database
        await waiterRegistration.registerWaiter(waiterSignUp);
        await WaitersApp.setWaiterId("bjorn");
        await WaitersApp.selectShift("thursday");

        assert.deepStrictEqual([], await WaitersApp.availableWaiters());
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    // try {
    //   it("should be able to update the selected day by removing a day", async () => {
    //     await WaitersApp.insertWaiter({
    //       emailOrName: "nicholas",
    //     });
    //     await WaitersApp.setWaiterId("nicholas");
    //     await WaitersApp.selectShift(["thursday", "tuesday", "friday"]);

    //     // update the selected day
    //     await WaitersApp.updateSelectedDay("thursday");
    //     assert.deepStrictEqual(
    //       [
    //         { waiter_name: "nicholas", day: "tuesday" },
    //         { waiter_name: "nicholas", day: "friday" },
    //       ],
    //       await WaitersApp.availableWaiters()
    //     );
    //   });
    // } catch (error) {
    //   console.log(error);
    //   throw error;
    // };
  });

  describe("admin", () => {
    // try {
    //   it("should be able to view the waiters that selected for a day", async () => {
    //     await WaitersApp.insertWaiter({
    //       emailOrName: "tendani",
    //     });
    //     await WaitersApp.setWaiterId("tendani");
    //     await WaitersApp.selectShift(["tuesday", "wednesday", "friday"]);

    //     await WaitersApp.insertWaiter({
    //       emailOrName: "asisipho",
    //     });
    //     await WaitersApp.setWaiterId("asisipho");
    //     await WaitersApp.selectShift(["wednesday", "thursday", "saturday"]);

    //     assert.deepStrictEqual(
    //       [
    //         { waiter_name: "tendani", day: "tuesday" },
    //         { waiter_name: "tendani", day: "wednesday" },
    //         { waiter_name: "tendani", day: "friday" },
    //         { waiter_name: "asisipho", day: "monday" },
    //         { waiter_name: "asisipho", day: "thursday" },
    //         { waiter_name: "asisipho", day: "saturday" },
    //       ],
    //       await WaitersApp.availableWaiters()
    //     );
    //   });
    // } catch (error) {
    //   console.log(error);
    //   throw error;
    // }

    try {
      it("should be able to delete registered waiters for a new week and not delete the admin", async () => {
        const saltRounds = 10;
        const password = "5793";
        const name = "mthunzi";

        // bcrypt the password from the user
        const hash = await bcrypt.hash(password, saltRounds);
        // Store the 'hash' in your password database or use it as needed
        const waiterSignUp = {
          name,
          hash,
        };
        // insert waiter into the waiter_registration database
        await waiterRegistration.registerWaiter(waiterSignUp);
        await WaitersApp.setWaiterId("mthunzi");

        // another waiter registration
        const saltRounds__ = 10;
        const password__ = "98272";
        const name__ = "nick";

        // bcrypt the password from the user
        const hash__ = await bcrypt.hash(password__, saltRounds__);
        // Store the 'hash' in your password database or use it as needed
        const waiterSignUp__ = {
          name__,
          hash__,
        };
        // insert waiter into the waiter_registration database
        await waiterRegistration.registerWaiter(waiterSignUp__);
        await WaitersApp.setWaiterId("mthunzi");

        // setting the roster to default
        await WaitersApp.deleteWaiters();

        // selecting all the waiters data
        const waiters = await database.manyOrNone(
          "select * from waiter_registration"
        );

        const adminHash = await database.oneOrNone("select password from waiter_registration where role = 'admin'");

        assert.deepStrictEqual(
          [
            {
              password: adminHash.password,
              role: "admin",
              waiter_id: 1,
              waiter_name: "tom",
            },
          ],
          waiters
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    // try {
    //   it("should be able to delete a waiter", async () => {
    //     await WaitersApp.insertWaiter({
    //       emailOrName: "anele",
    //     });

    //     await WaitersApp.insertWaiter({
    //       emailOrName: "nick",
    //     });

    //     // deleting a waiter
    //     await WaitersApp.deleteWaiter("nick");

    //     const waiters = await database.manyOrNone(`select * from workers`);

    //     assert.deepStrictEqual(
    //       [
    //         { waiter_id: 1, waiter_name: "tom", role: "admin" },
    //         { waiter_id: 2, waiter_name: "anele", role: "waiter" },
    //       ],
    //       waiters
    //     );
    //   });
    // } catch (error) {
    //   console.log(error);
    //   throw error;
    // };
  });

  // function to import the tests from other files
  function importTest(name, path) {
    describe(name, function () {
      import(path);
    });
  }

  describe("unit testing from other files", function () {
    beforeEach(function () {
      console.log("running something before each test");
    });
    importTest("generateNewPassword", "../services/generatePassword.js");
    after(function () {
      console.log("after all tests");
    });
  });

  after(() => {
    database.$pool.end;
  });
});
