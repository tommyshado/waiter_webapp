import assert from "assert";
import waitersApp from "../services/waiter-app.js";
import pgPromise from "pg-promise";
import "dotenv/config";

const pgp = pgPromise();
const connectionString = process.env.DATABASE_URL;
const database = pgp(connectionString);

// services imports
const WaitersApp = waitersApp(database);

describe("waiters app", function () {
  this.timeout(10000);

  beforeEach(async () => {
    try {
      await database.none(
        "TRUNCATE TABLE roster_webapp.selected_days RESTART IDENTITY CASCADE"
      );
      await database.none(
        "TRUNCATE TABLE roster_webapp.workers RESTART IDENTITY CASCADE"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  describe("waiters", () => {
    try {
      it("should be able to insert a waiter into the waiters table", async () => {
        await WaitersApp.insertWaiter("kat");
        assert.deepStrictEqual(
          { id: 1, name: "kat", role: "waiter" },
          await WaitersApp.getInsertedWaiter("kat")
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should be able to insert another waiter into the waiters table", async () => {
        await WaitersApp.insertWaiter("bjorn");
        assert.deepStrictEqual(
          { id: 1, name: "bjorn", role: "waiter" },
          await WaitersApp.getInsertedWaiter("bjorn")
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should be able to select a day to work on", async () => {
        await WaitersApp.insertWaiter("kat");
        await WaitersApp.setWaiterName("kat");
        await WaitersApp.selectWorkDay("monday");

        assert.deepStrictEqual(
          [{ selected_day: "monday" }],
          await WaitersApp.showSelectedDay()
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should be able to select another day to work on", async () => {
        await WaitersApp.insertWaiter("bjorn");
        await WaitersApp.setWaiterName("bjorn");
        await WaitersApp.selectWorkDay("thursday");

        assert.deepStrictEqual(
          [{ selected_day: "thursday" }],
          await WaitersApp.showSelectedDay()
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should be able to select more than one day to work on", async () => {
        await WaitersApp.insertWaiter("nicholas");
        await WaitersApp.setWaiterName("nicholas");
        await WaitersApp.selectWorkDay("thursday");

        await WaitersApp.insertWaiter("nicholas");
        await WaitersApp.setWaiterName("nicholas");
        await WaitersApp.selectWorkDay("tuesday");

        assert.deepStrictEqual(
          [{ selected_day: "thursday" }, { selected_day: "tuesday" }],
          await WaitersApp.showSelectedDay()
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  describe("admin", () => {
    try {
      it("should be able to view the waiters that selected for a day", async () => {
        await WaitersApp.insertWaiter("tom");
        await WaitersApp.setWaiterName("tom");
        await WaitersApp.selectWorkDay("thursday");

        await WaitersApp.insertWaiter("tom");
        await WaitersApp.setWaiterName("tom");
        await WaitersApp.selectWorkDay("tuesday");

        await WaitersApp.insertWaiter("tendani");
        await WaitersApp.setWaiterName("tendani");
        await WaitersApp.selectWorkDay("tuesday");

        await WaitersApp.insertWaiter("asisipho");
        await WaitersApp.setWaiterName("asisipho");
        await WaitersApp.selectWorkDay("thursday");

        assert.deepStrictEqual(
          [
            { selected_day: "thursday", waiters_name: "tom" },
            { selected_day: "tuesday", waiters_name: "tom" },
            { selected_day: "tuesday", waiters_name: "tendani" },
            { selected_day: "thursday", waiters_name: "asisipho" },
          ],
          await WaitersApp.waitersNameLst()
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should be able to delete waiters for a new week", async () => {
        await WaitersApp.insertWaiter("tom");
        await WaitersApp.setWaiterName("tom");
        await WaitersApp.selectWorkDay("thursday");

        await WaitersApp.insertWaiter("tendani");
        await WaitersApp.setWaiterName("tendani");
        await WaitersApp.selectWorkDay("tuesday");

        await WaitersApp.insertWaiter("asisipho");
        await WaitersApp.setWaiterName("asisipho");
        await WaitersApp.selectWorkDay("thursday");

        // setting the roster to default
        await WaitersApp.deleteWaiters();

        assert.deepStrictEqual([], await WaitersApp.waitersData());
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  after(() => {
    database.$pool.end;
  });
});
