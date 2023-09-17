
const WaiterRegistration = db => {
    // insert a waiter name and hashed password into the waiters table if not in the waiters table

    const registerWaiter = async register => {
        await db.none(`insert into workers (waiter_name, password, role) values ('${register.name}', '${register.hashedPassword}', 'waiter') on conflict do nothing`);
    };

    // retrieve a waiter name and hashed password from the waiters table
    const retrieveWaiter = async () => {

    };

    return {
        registerWaiter,
        retrieveWaiter,
    }

};

export default WaiterRegistration;