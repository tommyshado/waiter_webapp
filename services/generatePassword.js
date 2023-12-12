const generateNewPassword = (db) => {
    const updateUserPassword = async (details) => {
        const data = [
            details.hashedPassword,
            details.password.password
        ]
        await db.none(`update waiter_registration set password = $1 where password = $2`, data);
    };

    const getPassword = async (details) => {
        const password = await db.oneOrNone(
            `select password from waiter_registration where waiter_name = $1`, details.name);

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
