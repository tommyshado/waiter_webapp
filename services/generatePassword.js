const generateNewPassword = (db) => {

    const updateUserPassword = async (details) => {
        const oldHashedPassword = await updateUserPasswordHelper(details.name);
        const checkName =
            await db.oneOrNone(`update waiter_registration set password = '${details.hashedPassword}'
                                where password = '${oldHashedPassword.password}'
                                RETURNING waiter_name`);

        if (!checkName) return "not registered";
    };

    const updateUserPasswordHelper = async (username) => {
        return await db.oneOrNone(
            `select password from waiter_registration where waiter_name = '${username}'`
        );
    };

    return {
        updateUserPassword,
    };
};

export default generateNewPassword;