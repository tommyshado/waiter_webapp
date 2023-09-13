import assert from "assert";
import waitersApp from "../services/waiter-app.js";
import pgPromise from "pg-promise";
import "dotenv/config";

const pgp = pgPromise();
const connectionString = process.env.DATABASE_URL_TEST;
const database = pgp(connectionString);

// services imports
const WaitersApp = waitersApp(database);

describe("waiters app", function () {
  this.timeout(10000);

  beforeEach(async () => {
    try {
      await database.none("TRUNCATE TABLE workers RESTART IDENTITY CASCADE");
      await database.none(
        "TRUNCATE TABLE availability RESTART IDENTITY CASCADE"
      );
      // inserting the admin into the workers table
      await database.none(
        "insert into workers (waiter_name, role) values ('tom', 'admin')"
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
      it("should be able to insert and retrieve a waiter", async () => {
        await WaitersApp.insertWaiter({
          emailOrName: "kat",
        });
        const waiterRetrieval = await database.oneOrNone(
          `select waiter_name from workers`
        );
        assert.deepStrictEqual({ waiter_name: "kat" }, waiterRetrieval);
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should be able to insert and retrieve another waiter", async () => {
        await WaitersApp.insertWaiter({
          emailOrName: "bjorn",
        });
        const waiterRetrieval = await database.oneOrNone(
          `select waiter_name from workers`
        );
        assert.deepStrictEqual({ waiter_name: "bjorn" }, waiterRetrieval);
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should be able to insert a waiter once and retrieve one waiter", async () => {
        await WaitersApp.insertWaiter({
          emailOrName: "bjorn",
        });
        await WaitersApp.insertWaiter({
          emailOrName: "bjorn",
        });
        const waiterRetrieval = await database.oneOrNone(
          `select waiter_name from workers`
        );
        assert.deepStrictEqual({ waiter_name: "bjorn" }, waiterRetrieval);
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should be able to select and view the selected days to work on", async () => {
        await WaitersApp.insertWaiter({
          emailOrName: "kat",
        });
        await WaitersApp.setWaiterId("kat");
        await WaitersApp.selectShift(["monday", "tuesday", "thursday"]);
        assert.deepStrictEqual(
          [
            { waiter_name: "kat", day: "monday" },
            { waiter_name: "kat", day: "tuesday" },
            { waiter_name: "kat", day: "thursday" },
          ],
          await WaitersApp.availableWaiters()
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should not be able to show the selected days when selected days are less than 3 days", async () => {
        await WaitersApp.insertWaiter({
          emailOrName: "kat",
        });
        await WaitersApp.setWaiterId("kat");
        await WaitersApp.selectShift("thursday");

        await WaitersApp.insertWaiter({
          emailOrName: "kat",
        });
        await WaitersApp.setWaiterId("kat");
        await WaitersApp.selectShift("thursday");

        assert.deepStrictEqual([], await WaitersApp.availableWaiters());
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should be able to update the selected day by removing a day", async () => {
        await WaitersApp.insertWaiter({
          emailOrName: "nicholas",
        });
        await WaitersApp.setWaiterId("nicholas");
        await WaitersApp.selectShift(["thursday", "tuesday", "friday"]);

        // update the selected day
        await WaitersApp.updateSelectedDay("thursday");
        assert.deepStrictEqual(
          [
            { waiter_name: "nicholas", day: "tuesday" },
            { waiter_name: "nicholas", day: "friday" },
          ],
          await WaitersApp.availableWaiters()
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
        await WaitersApp.insertWaiter({
          emailOrName: "tendani",
        });
        await WaitersApp.setWaiterId("tendani");
        await WaitersApp.selectShift(["tuesday", "wednesday", "friday"]);

        await WaitersApp.insertWaiter({
          emailOrName: "asisipho",
        });
        await WaitersApp.setWaiterId("asisipho");
        await WaitersApp.selectShift(["wednesday", "thursday", "saturday"]);

        assert.deepStrictEqual(
          [
            { waiter_name: "tendani", day: "tuesday" },
            { waiter_name: "tendani", day: "wednesday" },
            { waiter_name: "tendani", day: "friday" },
            { waiter_name: "asisipho", day: "monday" },
            { waiter_name: "asisipho", day: "thursday" },
            { waiter_name: "asisipho", day: "saturday" },
          ],
          await WaitersApp.availableWaiters()
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should be able to delete waiters for a new week and not delete the admin", async () => {
        await WaitersApp.insertWaiter({
          emailOrName: "mthunzi",
        });
        await WaitersApp.setWaiterId("mthunzi");

        await WaitersApp.insertWaiter({
          emailOrName: "tendani",
        });
        await WaitersApp.setWaiterId("tendani");

        await WaitersApp.insertWaiter({
          emailOrName: "asisipho",
        });
        await WaitersApp.setWaiterId("asisipho");

        // setting the roster to default
        await WaitersApp.deleteWaiters();

        // selecting all the waiters data
        const waiters = await database.manyOrNone("select * from workers");

        assert.deepStrictEqual(
          [
            {
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

    try {
      it("should be able to delete a waiter", async () => {
        await WaitersApp.insertWaiter({
          emailOrName: "anele",
        });
  
        await WaitersApp.insertWaiter({
          emailOrName: "nick",
        });
  
        // deleting a waiter
        await WaitersApp.deleteWaiter("nick");
  
        const waiters = await database.manyOrNone(`select * from workers`);
  
        assert.deepStrictEqual(
          [
            { waiter_id: 1, waiter_name: "tom", role: "admin" },
            { waiter_id: 2, waiter_name: "anele", role: "waiter" },
          ],
          waiters
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
