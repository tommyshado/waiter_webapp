
const WaiterRegistration = db => {
    // insert a waiter name and hashed password into the waiters table if not in the waiters table

    const registerWaiter = async register => {
        await db.none(`insert into waiter_registration (waiter_name, password, role) values ('${register.name}', '${register.hash}', 'waiter') on conflict do nothing`);
    };

    // retrieve a waiter name and hashed password from the waiters table
    const retrieveHash = async (name) => await db.oneOrNone(`select password from waiter_registration where waiter_name = $1`, name);

    return {
        registerWaiter,
        retrieveHash,
    }

};

export default WaiterRegistration;