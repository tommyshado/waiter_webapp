import assert from "assert";
import waitersApp from "../services/waiterApp.js";
import WaiterRegistration from "../services/waiterRegistration.js";
import pgPromise from "pg-promise";
import "dotenv/config";

// bcrypt import
import bcrypt from "bcrypt";

const pgp = pgPromise();
const connectionString = process.env.DATABASE_URL_TEST || "postgres://elyifdyl:DA8caX8UfNVvqNrg5ZDX-MxaPfVnicdb@snuffleupagus.db.elephantsql.com/elyifdyl";
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
    };

    try {
      it("should be able to select and view the selected days to work on", async () => {
        const saltRounds = 10;
        const password = "123456";
        const name = "kat";

        const hash = await bcrypt.hash(password, saltRounds);
        // Store the 'hash' in your password database or use it as needed
        const waiterSignUp = {
          name,
          hash,
        };
        // insert waiter into the waiter_registration database
        await waiterRegistration.registerWaiter(waiterSignUp);

        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

        await database.none(`insert into availability (waiter_id, waiter_shift) values ('2', '${days[0]}')`);
        await database.none(`insert into availability (waiter_id, waiter_shift) values ('2', '${days[1]}')`);
        await database.none(`insert into availability (waiter_id, waiter_shift) values ('2', '${days[2]}')`);

        const availability = await database.manyOrNone(`select * from availability`);

        assert.deepStrictEqual(
          [
            { waiter_id: 2, waiter_shift: 'monday' },
            { waiter_id: 2, waiter_shift: 'tuesday' },
            { waiter_id: 2, waiter_shift: 'wednesday' }
          ],
          availability
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

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

    try {
        it("should be able to update the selected day by removing a day", async () => {
          const saltRounds = 10;
          const password = "123456";
          const name = "tendani";
  
          const hash = await bcrypt.hash(password, saltRounds);
          // Store the 'hash' in your password database or use it as needed
          const waiterSignUp = {
            name,
            hash,
          };
          // insert waiter into the waiter_registration database
          await waiterRegistration.registerWaiter(waiterSignUp);
  
          const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  
          await database.none(`insert into availability (waiter_id, waiter_shift) values ('2', '${days[1]}')`);
          await database.none(`insert into availability (waiter_id, waiter_shift) values ('2', '${days[2]}')`);
          await database.none(`insert into availability (waiter_id, waiter_shift) values ('2', '${days[3]}')`);
  
          const availability = await database.manyOrNone(`select * from availability`);
  
          assert.deepStrictEqual(
            [
              { waiter_id: 2, waiter_shift: 'tuesday' },
              { waiter_id: 2, waiter_shift: 'wednesday' },
              { waiter_id: 2, waiter_shift: 'thursday' }
            ],
            availability
          );
  
          // update a day by deleting and insert another day in the deleted day place
          await database.none(`delete from availability where waiter_id = '2' and waiter_shift = 'tuesday'`);
  
          const availability__ = await database.manyOrNone(`select * from availability`);
  
          assert.deepStrictEqual(
            [
              { waiter_id: 2, waiter_shift: 'wednesday' },
              { waiter_id: 2, waiter_shift: 'thursday' }
            ],
            availability__
          );
        });
    } catch (error) {
      console.log(error);
      throw error;
    };
  });

  describe("admin", () => {
    try {
      it("should be able to view the waiters that selected for a day", async () => {
        const saltRounds = 10;
        const password = "123456";
        const name = "asisipho";

        const hash = await bcrypt.hash(password, saltRounds);
        // Store the 'hash' in your password database or use it as needed
        const waiterSignUp = {
          name,
          hash,
        };
        // insert waiter into the waiter_registration database
        await waiterRegistration.registerWaiter(waiterSignUp);

        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

        await database.none(`insert into availability (waiter_id, waiter_shift) values ('2', '${days[0]}')`);
        await database.none(`insert into availability (waiter_id, waiter_shift) values ('2', '${days[1]}')`);
        await database.none(`insert into availability (waiter_id, waiter_shift) values ('2', '${days[2]}')`);
        await database.none(`insert into availability (waiter_id, waiter_shift) values ('2', '${days[3]}')`);
        await database.none(`insert into availability (waiter_id, waiter_shift) values ('2', '${days[4]}')`);

        const availability = await database.manyOrNone(`select * from availability`);

        assert.deepStrictEqual(
          [
            { waiter_id: 2, waiter_shift: 'monday' },
            { waiter_id: 2, waiter_shift: 'tuesday' },
            { waiter_id: 2, waiter_shift: 'wednesday' },
            { waiter_id: 2, waiter_shift: 'thursday' },
            { waiter_id: 2, waiter_shift: 'friday' },
          ],
          availability
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should be able to delete available waiters to work for a new week", async () => {
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
        const waiters = await database.manyOrNone("select * from availability");

        assert.deepStrictEqual([], waiters);
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should be able to delete a waiter from the availability table", async () => {
        const saltRounds = 10;
        const password = "2211";
        const name = "bjorn";

        const hash = await bcrypt.hash(password, saltRounds);
        // Store the 'hash' in your password database or use it as needed
        const waiterSignUp = {
          name,
          hash,
        };
        // insert waiter into the waiter_registration database
        await waiterRegistration.registerWaiter(waiterSignUp);

        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

        await database.none(`insert into availability (waiter_id, waiter_shift) values ('2', '${days[0]}')`);
        await database.none(`insert into availability (waiter_id, waiter_shift) values ('2', '${days[1]}')`);
        await database.none(`insert into availability (waiter_id, waiter_shift) values ('2', '${days[2]}')`);

        const availability = await database.manyOrNone(`select * from availability`);

        assert.deepStrictEqual(
          [
            { waiter_id: 2, waiter_shift: 'monday' },
            { waiter_id: 2, waiter_shift: 'tuesday' },
            { waiter_id: 2, waiter_shift: 'wednesday' }
          ],
          availability
        );

        // deleting a waiter in the availability table
        await database.manyOrNone(`delete from availability where waiter_id = '2' and waiter_shift = 'wednesday'`);

        const availability__ = await database.manyOrNone("select * from availability");

        assert.deepStrictEqual(
          [
            { waiter_id: 2, waiter_shift: 'monday' },
            { waiter_id: 2, waiter_shift: 'tuesday' },
          ],
          availability__
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    };
  });

  after(() => {
    database.$pool.end;
  });
});
