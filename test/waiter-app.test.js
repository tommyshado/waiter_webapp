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
      await database.none(
        "TRUNCATE TABLE waiters RESTART IDENTITY CASCADE"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  describe("waiters", () => {
    try {
      it("should be able to insert and retrieve a waiter into the waiters table", async () => {
        await WaitersApp.insertWaiter("kat");
        assert.deepStrictEqual(
          { waiter_name: "kat" },
          await WaitersApp.retrieveWaiter()
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    };

    try {
      it("should be able to insert and retrieve another waiter into the waiters table", async () => {
        await WaitersApp.insertWaiter("bjorn");
        assert.deepStrictEqual(
          { waiter_name: "bjorn" },
          await WaitersApp.retrieveWaiter()
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    };

    try {
      it("should be able to select and view the selected day to work on", async () => {
        await WaitersApp.insertWaiter("kat");
        await WaitersApp.setWaiterId("kat");
        await WaitersApp.selectShift("monday");

        assert.deepStrictEqual(
          [{ day: "monday", waiter_name: "kat" }],
          await WaitersApp.availableWaiters()
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should be able to select and view another selected day to work on", async () => {
        await WaitersApp.insertWaiter("bjorn");
        await WaitersApp.setWaiterId("bjorn");
        await WaitersApp.selectShift("thursday");

        assert.deepStrictEqual(
          [{ day: "thursday", waiter_name: "bjorn" }],
          await WaitersApp.availableWaiters()
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    };

    try {
      it("should be able to select and view multiple selected days to work on", async () => {
        await WaitersApp.insertWaiter("nicholas");
        await WaitersApp.setWaiterId("nicholas");
        await WaitersApp.selectShift("thursday");

        await WaitersApp.insertWaiter("nicholas");
        await WaitersApp.setWaiterId("nicholas");
        await WaitersApp.selectShift("tuesday");

        assert.deepStrictEqual(
          [{ day: "thursday", waiter_name: "nicholas" }, { day: "tuesday", waiter_name: "nicholas" }],
          await WaitersApp.availableWaiters()
        );
      });
    } catch (error) {
      console.log(error);waitersData
      throw error;
    };
  });

  describe("admin", () => {
    try {
      it("should be able to view the waiters that selected for a day", async () => {
        await WaitersApp.insertWaiter("tom");
        await WaitersApp.setWaiterId("tom");
        await WaitersApp.selectShift("thursday");

        await WaitersApp.insertWaiter("tom");
        await WaitersApp.setWaiterId("tom");
        await WaitersApp.selectShift("tuesday");

        await WaitersApp.insertWaiter("tendani");
        await WaitersApp.setWaiterId("tendani");
        await WaitersApp.selectShift("tuesday");

        await WaitersApp.insertWaiter("asisipho");
        await WaitersApp.setWaiterId("asisipho");
        await WaitersApp.selectShift("thursday");

        assert.deepStrictEqual(
          [
            { day: "thursday", waiter_name: "tom" },
            { day: "tuesday", waiter_name: "tom" },
            { day: "tuesday", waiter_name: "tendani" },
            { day: "thursday", waiter_name: "asisipho" },
          ],
          await WaitersApp.availableWaiters()
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    try {
      it("should be able to delete waiters for a new week", async () => {
        await WaitersApp.insertWaiter("tom");
        await WaitersApp.setWaiterId("tom");
        await WaitersApp.selectShift("thursday");

        await WaitersApp.insertWaiter("tendani");
        await WaitersApp.setWaiterId("tendani");
        await WaitersApp.selectShift("tuesday");

        await WaitersApp.insertWaiter("asisipho");
        await WaitersApp.setWaiterId("asisipho");
        await WaitersApp.selectShift("thursday");

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
