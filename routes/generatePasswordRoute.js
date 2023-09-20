

const generatePassword = (logic) => {
    const passwordRoute = async (req, res) => {
        const { name } = req.body;
        let admin;
        let waiter;
        if (name === "tom") {
            admin = true
            waiter = false;
        } else {
            waiter = name;
        };
        res.render("generatePassword"), {
            adminPage: admin,
            waiterPage: waiter
        };
    };

    const updatePassword = async (req, res) => {
        // CHECK if the username entered by the user is in the waiter_registration database IF TRUE...
            // GET the username password from the database AND...
            // COMPARE with password that the user entered using bcrypt 
                // IF the passwords match
                    // UPDATE the old password with the new hashed password then...
                    // show a success message

            // otherwise, show an error message

        // OTHERWISE, show an error message
    };

    return {
        passwordRoute,
        updatePassword
    }
};

export default generatePassword;