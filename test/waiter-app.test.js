import assert from "assert";
import waitersApp from "../services/waiter-app.js"
import pgPromise from "pg-promise";
import "dotenv/config";

const pgp = pgPromise();
const connectionString = process.env.DATABASE_URL;
const database = pgp(connectionString);

// services imports
const WaitersApp = waitersApp(database);

describe("waiters app", function() {
    this.timeout(9000);

    beforeEach(async () => {
        try {
            await database.none("TRUNCATE TABLE roster_webapp.selected_days RESTART IDENTITY CASCADE");
            await database.none("TRUNCATE TABLE roster_webapp.waiters RESTART IDENTITY CASCADE");
        } catch (error) {
            console.log(error);
            throw(error);
        };
    });

    describe("waiters", () => {
        try {
            it("should be able to insert a waiter into the waiters table", async () => {
                await WaitersApp.insertWaiter("kat");
                assert.deepStrictEqual([{id: 1, name: "kat"}], await WaitersApp.getInsertedWaiter());
            });
            
        } catch (error) {
            console.log(error);
            throw(error);
        };

        try {
            it("should be able to insert another waiter into the waiters table", async () => {
                await WaitersApp.insertWaiter("bjorn");
                assert.deepStrictEqual([{id: 2, name: "kat"}], await WaitersApp.getInsertedWaiter());
            });
            
        } catch (error) {
            console.log(error);
            throw(error);
        };


        try {
            it("should be able to select a day to work on", async () => {
                await WaitersApp.insertWaiter("kat");
                WaitersApp.selectWorkDay("monday");
    
                assert.deepStrictEqual({selected_day: "monday"}, WaitersApp.showSelectedDay());
            });
            
        } catch (error) {
            console.log(error);
            throw(error);
        };

        try {
            it("should be able to select another day to work on", async () => {
                await WaitersApp.insertWaiter("bjorn");
                WaitersApp.selectWorkDay("thursday");
    
                assert.deepStrictEqual({selected_day: "thursday"}, WaitersApp.showSelectedDay());
            });
            
        } catch (error) {
            console.log(error);
            throw(error);
        };

        try {
            it("should be able to select more than one day to work on", async () => {
                await WaitersApp.insertWaiter("nicholas");
                WaitersApp.selectWorkDay("thursday");
                WaitersApp.selectWorkDay("tuesday");
    
                assert.deepStrictEqual({selected_day: "thursday"}, WaitersApp.showSelectedDay());
                assert.deepStrictEqual({selected_day: "tuesday"}, WaitersApp.showSelectedDay());
            });
            
        } catch (error) {
            console.log(error);
            throw(error);
        };

    });

    describe("admin", () => {

        try {
            it("should be able to view the selected days by the waiters", async () => {
                await WaitersApp.insertWaiter("tom");
                await WaitersApp.insertWaiter("tendani");
                await WaitersApp.insertWaiter("asisipho");

                WaitersApp.selectWorkDay("thursday");
                WaitersApp.selectWorkDay("tuesday");
                WaitersApp.selectWorkDay("thursday");
                WaitersApp.selectWorkDay("tuesday");
    
                assert.deepStrictEqual(["thursday", "tuesday", "thursday", "tuesday"], WaitersApp.viewSelectedDays());
            });
            
        } catch (error) {
            console.log(error);
            throw(error);
        };

        try {
            it("should be able to delete waiters for a new week", async () => {
                await WaitersApp.insertWaiter("tom");
                await WaitersApp.insertWaiter("tendani");
                await WaitersApp.insertWaiter("asisipho");

                WaitersApp.selectWorkDay("thursday");
                WaitersApp.selectWorkDay("tuesday");
                WaitersApp.selectWorkDay("thursday");
                WaitersApp.selectWorkDay("tuesday");
                // setting the roster to default
                WaitersApp.deleteWaiters();
    
                assert.deepStrictEqual([], WaitersApp.viewSelectedDays());
            });
            
        } catch (error) {
            console.log(error);
            throw(error);
        }

    });

    after(() => {
        db.$pool.end;
    });

});