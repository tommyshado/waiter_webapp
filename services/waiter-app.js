const waitersApp = db => {
    
    const insertWaiter = async waiterName => {
        const checksWaiter = await db.oneOrNone(`select * from waiters where waiter_name = $1`, waiterName);
        if (!checksWaiter) {
            await db.none("insert into waiters (waiter_name) values ($1)", [waiterName]);
        };
    };
    
    let waitersId;

    const setWaiterId = async waiterName => {
        const availableWaiter = await db.oneOrNone(`select waiter_id from waiters where waiter_name = $1`, waiterName);
        waitersId = availableWaiter.waiter_id;
    };

    // const getInsertedWaiter = async waiterName => await db.oneOrNone(`select * from roster_webapp.workers where name = $1`, waiterName);
    
    const selectShift = async shift => {
        const checksShift = Array.isArray(shift);
        // create a queries to not allow a waiter to select the same day twice for one week
        if (!checksShift) {
            await db.none(`insert into availability (waiter_id, waiter_shift) values ($1, $2)`, [waitersId, shift]);
        } else {
            shift.forEach(async oneShift => {
                await db.none(`insert into availability (waiter_id, waiter_shift) values ($1, $2)`, [waitersId, oneShift]);
            });
        };
    };

    // const showSelectedDay = async () => await db.manyOrNone(`select selected_day from roster_webapp.selected_days where waiters_name = $1`, waitersId);

    const availableWaiters = async () => await db.manyOrNone("SELECT waiters.waiter_name, shifts.day FROM waiters INNER JOIN availability ON waiters.waiter_id = availability.waiter_id INNER JOIN shifts ON availability.waiter_shift = shifts.day");

    // const waitersData = async () => await db.manyOrNone("select * from roster_webapp.workers");

    const deleteWaiters = async () => await db.any("TRUNCATE TABLE waiters RESTART IDENTITY CASCADE");

    return {
        insertWaiter,
        setWaiterId,
        selectShift,
        // getInsertedWaiter,
        // showSelectedDay,
        availableWaiters,
        // waitersData,
        deleteWaiters,
    };
};

export default waitersApp;