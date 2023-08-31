const waitersApp = db => {
    
    const insertWaiter = async waiterName => {
        const getWaiter = await db.oneOrNone(`select * from roster_webapp.workers where name = $1`, waiterName);
        if (!getWaiter) {
            await db.none("insert into roster_webapp.workers (name, role) values ($1, $2)", [waiterName, "waiter"]);
        };
    };
    
    let waitersName;

    const setWaiterName = async waiterName => {
        const availableWaiter = await db.oneOrNone(`select name from roster_webapp.workers where name = $1`, waiterName);
        waitersName = availableWaiter.name;
    };

    const getInsertedWaiter = async waiterName => await db.oneOrNone(`select * from roster_webapp.workers where name = $1`, waiterName);
    
    const selectWorkDay = async weekDay => {
        // create a queries to not allow a waiter to select the same day twice for one week
        if (waitersName) {
            await db.none(`insert into roster_webapp.selected_days (waiters_name, selected_day) values ($1, $2)`, [waitersName, weekDay]);
        };
    };

    const showSelectedDay = async () => await db.manyOrNone(`select selected_day from roster_webapp.selected_days where waiters_name = $1`, waitersName);

    const waitersNameLst = async () => await db.manyOrNone("select waiters_name, selected_day from roster_webapp.selected_days");

    const waitersData = async () => await db.manyOrNone("select * from roster_webapp.workers");

    const deleteWaiters = async () => await db.any("TRUNCATE TABLE roster_webapp.workers RESTART IDENTITY CASCADE");

    return {
        insertWaiter,
        setWaiterName,
        getInsertedWaiter,
        selectWorkDay,
        showSelectedDay,
        waitersNameLst,
        waitersData,
        deleteWaiters,
    };
};

export default waitersApp;