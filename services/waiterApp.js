const waitersApp = db => {

    const checksUser = async name => {
        const query = await db.oneOrNone(`select waiter_name from workers where role = 'admin' and waiter_name = '${name}'`);
        if (query) return true;
        else return false;
    };

    const insertWaiter = async login => {
        const isUser = await checksUser(login.emailOrName);
        if (!isUser) {
            await db.none(`insert into workers (waiter_name, role) values ('${login.emailOrName}', 'waiter') on conflict do nothing`);
            return "waiter";
        } else {
            return "admin"
        };
    };

    const getWaiter = async (waiterName) => {
        const name = waiterName.emailOrName;
        if (name) {
            const waiter = await db.oneOrNone(`select * from waiter_registration where waiter_name = '${name}' and role = 'waiter'`);

            if (waiter) return "waiter";
            else return "admin";
        };
    };

    let waitersId;

    const setWaiterId = async waiterName => {
        const availableWaiter = await db.oneOrNone(
            `select waiter_id from workers where waiter_name = $1`,
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
                const availability = await db.any(`select * from availability where waiter_id = ${waitersId} and waiter_shift = '${oneShift}'`);
                if (availability.length === 0) {
                    await db.none(`insert into availability (waiter_id, waiter_shift) values ('${waitersId}', '${oneShift}')`);
                };
            });
        } else {
            return false;
        };
    };

    const availableWaiters = async () =>
        await db.manyOrNone(
            "SELECT workers.waiter_name, shifts.day, workers.waiter_id FROM workers INNER JOIN availability ON workers.waiter_id = availability.waiter_id INNER JOIN shifts ON availability.waiter_shift = shifts.day"
        );

    const updateSelectedDay = async shift =>
        await db.none(
            `delete from availability where waiter_shift = '${shift}' and waiter_id = '${waitersId}'`
        ); // shifts.day insert the day I want to update

    const shifts = async () => db.manyOrNone(`select waiter_shift from availability where waiter_id = '${waitersId}'`);

    const weekDays = async () => db.any("select day from shifts");

    // grab the waiter id, and day that they selected from the parameters or url
    // delete waiter records based on the waiter id and the selected day within the availability table
    // this function takes in two parameters, waiter id and day both comes from the url
    const deleteWaiter = async (waiterId, selectedDay) => await db.any(`delete from availability where waiter_id = '${waiterId}' and waiter_shift = '${selectedDay}'`);

    const deleteWaiters = async () => await db.any("delete from workers where role = 'waiter'");

    return {
        insertWaiter,
        getWaiter,
        setWaiterId,
        selectShift,
        availableWaiters,
        updateSelectedDay,
        weekDays,
        shifts,
        deleteWaiter,
        deleteWaiters,
    };
};

export default waitersApp;
