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

    const getUsername = (waiterName) => {
        return waiterName;
    };

    const insertWaiter = async (waiterName) => {
        const getWaiter = await db.oneOrNone(`select * from roster_webapp.workers where name = $1`, waiterName);
        if (!getWaiter) await db.none("insert into roster_webapp.workers (name, role) values ($1, $2)", [waiterName, "waiter"]);
    };

    const getInsertedWaiter = async (waiterName) => {
        return await db.oneOrNone(`select * from roster_webapp.workers where name = $1`, waiterName);
    };
    
    const selectWorkDay = weekDay => {};

    const showSelectedDay = () => {};

    const viewSelectedDays = () => {};

    const deleteWaiters = () => {};

    return {
        // validateUsername,
        // setValidUsername,
        getUsername,
        insertWaiter,
        getInsertedWaiter,
        selectWorkDay,
        showSelectedDay,
        viewSelectedDays,
        deleteWaiters,
    };
};

export default waitersApp;