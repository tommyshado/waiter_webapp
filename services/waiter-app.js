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
    }

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
                await db.none(`insert into availability (waiter_id, waiter_shift) values ('${waitersId}', '${oneShift}') on conflict do nothing`);
            });
        } else {
            return false;
        };
    };

    const availableWaiters = async () =>
        await db.manyOrNone(
            "SELECT workers.waiter_name, shifts.day FROM workers INNER JOIN availability ON workers.waiter_id = availability.waiter_id INNER JOIN shifts ON availability.waiter_shift = shifts.day"
        );

    const updateSelectedDay = async shift =>
        await db.none(
            `delete from availability where waiter_shift = '${shift}' and waiter_id = '${waitersId}'`
        ); // shifts.day insert the day I want to update

    const shifts = () => db.manyOrNone(`select waiter_shift from availability where waiter_id = '${waitersId}'`);

    const weekDays = () => db.any("select day from shifts");

    const deleteWaiters = async () => await db.any("TRUNCATE TABLE workers RESTART IDENTITY CASCADE");

    return {
        insertWaiter,
        setWaiterId,
        selectShift,
        availableWaiters,
        updateSelectedDay,
        weekDays,
        shifts,
        deleteWaiters,
    };
};

export default waitersApp;
