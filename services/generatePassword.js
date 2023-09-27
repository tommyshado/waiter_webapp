const generateNewPassword = (db) => {
    const updateUserPassword = async (details) => {
        await db.none(`update waiter_registration set password = '${details.hashedPassword}'
                       where password = '${details.password.password}'`);
    };

    const getPassword = async (details) => {
        const password = await db.oneOrNone(
            `select password from waiter_registration where waiter_name = '${details.name}'`
        );

        if (password !== null) {
            return password;

        } else {
            return null;
        };
    };

    return {
        updateUserPassword,
        getPassword,
    };
};

export default generateNewPassword;
