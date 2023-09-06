const waitersApp = db => {
    const insertWaiter = async waiterName => {
        const checksWaiter = await db.oneOrNone(
            `select * from waiters where waiter_name = $1`,
            waiterName
        );
        if (!checksWaiter) {
            await db.none("insert into waiters (waiter_name) values ($1)", [
                waiterName,
            ]);
        }
    };

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

        if (!checksShift) {
            const checkWaiter = await db.oneOrNone(
                `select * from availability where waiter_id = ${waitersId} and waiter_shift = '${shift}'`
            );
            if (!checkWaiter) {
                await db.none(
                    `insert into availability (waiter_id, waiter_shift) values ($1, $2)`,
                    [waitersId, shift]
                );
            }
        } else {
            shift.forEach(async oneShift => {
                const checkWaiter = await db.oneOrNone(
                    `select * from availability where waiter_id = ${waitersId} and waiter_shift = '${oneShift}'`
                );
                if (!checkWaiter) {
                    await db.none(
                        `insert into availability (waiter_id, waiter_shift) values ($1, $2)`,
                        [waitersId, oneShift]
                    );
                }
            });
        }
    };

    const availableWaiters = async () =>
        await db.manyOrNone(
            "SELECT waiters.waiter_name, shifts.day FROM waiters INNER JOIN availability ON waiters.waiter_id = availability.waiter_id INNER JOIN shifts ON availability.waiter_shift = shifts.day"
        );

    const updateSelectedDay = async shift =>
        await db.none(
            `UPDATE shifts SET day = '${shift}' FROM waiters INNER JOIN availability ON waiters.waiter_id = availability.waiter_id WHERE waiters.waiter_name = :waiter_name AND shifts.day = day`
        ); // shifts.day insert the day I want to update

    const deleteWaiters = async () => await db.any("TRUNCATE TABLE waiters RESTART IDENTITY CASCADE");

    return {
        insertWaiter,
        setWaiterId,
        selectShift,
        availableWaiters,
        updateSelectedDay,
        deleteWaiters,
    };
};

export default waitersApp;
