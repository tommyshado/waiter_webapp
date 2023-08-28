import assert from "assert";
import pgPromise from "pg-promise";
import "dotenv/config";

const pgp = pgPromise();
const connectionString = process.env.DATABASE_URL;
const database = pgp(connectionString);

// services imports

describe("waiters app", function() {
    this.timeout(9000);

    beforeEach(async () => {
        try {

        } catch (error) {
            console.log(error);
            throw(error);
        };
    });

});