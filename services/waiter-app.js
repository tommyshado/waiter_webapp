const waitersApp = (db) => {
    let waiterName = "";

    const validateUsername = name => {
        const lowerLettersName = name.toLowerCase().trim();
        return (/^[a-zA-Z]+$/).test(lowerLettersName);
    };

    const setValidUsername = username => {
        if (validateUsername(username)) {
            waiterName = username;
            return true;
        }return false;
    };

    const insertWaiter = async () => {
        const getWaiter = await db.oneOrNone(`select * from roster_webapp.waiter where name = $1`, waiterName);
        if (!getWaiter) await db.none("insert into roster_webapp.waiter (name) values ($1)", [waiterName]);
    };

    const getInsertedWaiter = async () => {
        return await db.one(`select * from roster_webapp.waiter where name = $1`, waiterName);
    };
    
    const selectWorkDay = async weekDay => {};

    const showSelectedDay = () => {};

    const viewSelectedDays = () => {};

    const deleteWaiters = () => {};

    return {
        validateUsername,
        setValidUsername,
        insertWaiter,
        getInsertedWaiter,
        selectWorkDay,
        showSelectedDay,
        viewSelectedDays,
        deleteWaiters,
    };
};

export default waitersApp;