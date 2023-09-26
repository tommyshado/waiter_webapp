const generateNewPassword = (db, bcrypt) => {
    const updateUserPassword = async (details) => {
        const oldHashedPassword = await updateUserPasswordHelper(details);

        if (oldHashedPassword) {
            await db.oneOrNone(`update waiter_registration set password = '${details.hashedPassword}'
                                where password = '${oldHashedPassword.password}'`);
            return true;
        } else if (oldHashedPassword === false) {
            return false;

        } else if (oldHashedPassword === null) {
            return null;
        }
    };

    const updateUserPasswordHelper = async (details) => {
        const password = await db.oneOrNone(
            `select password from waiter_registration where waiter_name = '${details.name}'`
        );
        
        if (password.password) {
            bcrypt.compare(details.oldPassword, password.password).then(result => {
                if (result) return password;
                else if (!result) return false;
            });
        } else {
            return null;
        };
    };

    return {
        updateUserPassword,
    };
};

export default generateNewPassword;
