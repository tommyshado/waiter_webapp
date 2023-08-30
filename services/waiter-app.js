const waitersApp = (db) => {
    // let waiterName = "";

    // const validateUsername = name => {
    //     const lowerLettersName = name.toLowerCase().trim();
    //     return (/^[a-zA-Z]+$/).test(lowerLettersName);
    // };

    // const setValidUsername = username => {
    //     if (validateUsername(username)) {
    //         waiterName = username;
    //         return true;
    //     }return false;
    // };
    
    const insertWaiter = async waiterName => {
        const getWaiter = await db.oneOrNone(`select * from roster_webapp.workers where name = $1`, waiterName);
        if (!getWaiter) {
            await db.none("insert into roster_webapp.workers (name, role) values ($1, $2)", [waiterName, "waiter"]);
        };
    };
    
    let waiterId;

    const setWaiterId = async waiterName => {
        const availableWaiter = await db.oneOrNone(`select id from roster_webapp.workers where name = $1`, waiterName);
        waiterId = availableWaiter.id;
    };

    const getInsertedWaiter = async waiterName => {
        const availableWaiter = await db.oneOrNone(`select * from roster_webapp.workers where name = $1`, waiterName);
        return availableWaiter;
    };
    
    const selectWorkDay = async weekDay => {
        if (waiterId) {
            await db.none(`insert into roster_webapp.selected_days (waiters_id, selected_days) values ($1, $2)`, [waiterId, weekDay]);
        };
    };

    const showSelectedDay = async () => {
        return await db.manyOrNone(`select selected_days from roster_webapp.selected_days where waiters_id = ${waiterId}`);
    };

    const viewSelectedDays = async () => {
        const waiterSelectedDays = await db.manyOrNone("select selected_days from roster_webapp.selected_days");
        return waiterSelectedDays.map(day => day.selected_days);
    };

    const deleteWaiters = async () => await db.any("TRUNCATE TABLE roster_webapp.workers RESTART IDENTITY CASCADE");

    return {
        // validateUsername,
        // setValidUsername,
        insertWaiter,
        setWaiterId,
        getInsertedWaiter,
        selectWorkDay,
        showSelectedDay,
        viewSelectedDays,
        deleteWaiters,
    };
};

export default waitersApp;