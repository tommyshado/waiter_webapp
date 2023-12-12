
const WaiterRegistration = db => {
    // insert a waiter name and hashed password into the waiters table if not in the waiters table

    const registerWaiter = async register => {
        const data = [
            register.name,
            register.hash,
            'waiter'
        ];

        await db.none(`insert into waiter_registration (waiter_name, password, role) values ($1, $2, $3) on conflict do nothing`, data);
    };

    // retrieve a waiter name and hashed password from the waiters table
    const retrieveHash = async (name) => await db.oneOrNone(`select password from waiter_registration where waiter_name = $1`, name);

    return {
        registerWaiter,
        retrieveHash,
    }

};

export default WaiterRegistration;