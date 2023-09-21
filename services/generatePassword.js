const generateNewPassword = (db) => {
    const oldPasswordHash = async (username) => {
        return await db.oneOrNone(
            `select password from waiter_registration where waiter_name = '${username}'`
        );
    };

    const updateUserPassword = async (details) => {
        const oldHashedPassword = await oldPasswordHash(details.name);
        const checkName =
            await db.oneOrNone(`update waiter_registration set password = '${details.hashedPassword}'
                                where password = '${oldHashedPassword.password}'
                                RETURNING waiter_name`);

        if (!checkName) return "not registered";
    };

    return {
        updateUserPassword,
    };
};

export default generateNewPassword;