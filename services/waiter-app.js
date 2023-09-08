const waitersApp = db => {

    const insertWaiter = async waiterName => await db.none(`insert into waiters (waiter_name) values ('${waiterName}') on conflict do nothing`);

    let waitersId;

    const setWaiterId = async waiterName => {
        const availableWaiter = await db.oneOrNone(
            `select waiter_id from waiters where waiter_name = $1`,
            waiterName
        );
        waitersId = availableWaiter.waiter_id;
    };

    const selectShift = async shift => {
        const checksShift = Array.isArray(shift);

        if (!checksShift || shift.length < 3) {
            return null;

        } else if (checksShift && shift.length >= 3 && shift.length <= 5) {
            shift.forEach(async oneShift => {
                await db.none(`insert into availability (waiter_id, waiter_shift) values ('${waitersId}', '${oneShift}') on conflict do nothing`);
            });
        } else {
            return false;
        };
    };

    const availableWaiters = async () =>
        await db.manyOrNone(
            "SELECT waiters.waiter_name, shifts.day FROM waiters INNER JOIN availability ON waiters.waiter_id = availability.waiter_id INNER JOIN shifts ON availability.waiter_shift = shifts.day"
        );

    const updateSelectedDay = async shift =>
        await db.none(
            `delete from availability where waiter_shift = '${shift}'`
        ); // shifts.day insert the day I want to update

    const shifts = () => db.manyOrNone(`select waiter_shift from availability where waiter_id = '${waitersId}'`);

    const deleteWaiters = async () => await db.any("TRUNCATE TABLE waiters RESTART IDENTITY CASCADE");

    return {
        insertWaiter,
        setWaiterId,
        selectShift,
        availableWaiters,
        updateSelectedDay,
        shifts,
        deleteWaiters,
    };
};

export default waitersApp;
