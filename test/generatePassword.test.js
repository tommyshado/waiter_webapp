import assert from "assert";
import generateNewPassword from "../services/generatePassword.js";
import pgPromise from "pg-promise";
import "dotenv/config";
import bcrypt from "bcrypt";

const pgp = pgPromise();
const connectionString = process.env.DATABASE_URL_TEST;
const database = pgp(connectionString);

const logic = generateNewPassword(database);

describe("new password making unit testing", function () {
    this.timeout(10000);
    beforeEach(async () => {
        try {
            await database.none(
                "TRUNCATE TABLE waiter_registration RESTART IDENTITY CASCADE"
            );

        } catch (error) {
            console.log(error);
            throw (error);
        };
    });

    it("should be able to get the hashed password for a sign up username", async () => {
        // user registration into the app
        const saltRounds = 10;
        const password = "12345";
        const name = "mthunzi";

        const hash = await bcrypt.hash(password, saltRounds);
        // Store the 'hash' in your password database or use it as needed
        const waiterSignUp = {
            name,
            hash,
        };
        // inserting the admin into the workers table
        await database.none(
            `insert into waiter_registration (waiter_name, password, role) values ('${waiterSignUp.name}', '${waiterSignUp.hash}', 'waiter')`
        );
        const password__ = await database.oneOrNone(`select password from waiter_registration where waiter_name = '${name}'`);

        assert.deepStrictEqual({
            password: waiterSignUp.hash,
        }, password__);
    });

    it("should be able to update the old password for a given user with a new password", async () => {
        // user registration into the app
        const saltRounds = 10;
        const password = "22335";
        const name = "kat";

        const hash = await bcrypt.hash(password, saltRounds);
        // Store the 'hash' in your password database or use it as needed
        const waiterSignUp = {
            name,
            hash,
        };
        // inserting the admin into the workers table
        await database.none(
            `insert into waiter_registration (waiter_name, password, role) values ('${waiterSignUp.name}', '${waiterSignUp.hash}', 'waiter')`
        );

        // grabbing the inserted password
        const password__ = await database.oneOrNone(`select password from waiter_registration where waiter_name = '${name}'`);

        // checking the password
        assert.deepStrictEqual({
            password: waiterSignUp.hash,
        }, password__);

        // generating a new password for 'kat'
        const newPassword = "123";

        // creating a new hash
        const newHash = await bcrypt.hash(newPassword, saltRounds);

        // update old hashed password with new hashed password
        await database.none(`update waiter_registration set password = '${newHash}' where password = '${hash}'`);

        // grab new hashed password
        const newHashedPassword = await database.oneOrNone(`select password from waiter_registration where waiter_name = '${name}'`);

        assert.deepStrictEqual({
            password: newHash,
        }, newHashedPassword);
    });
});
