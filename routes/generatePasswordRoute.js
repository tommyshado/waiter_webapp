

const generatePassword = (logic, bcrypt) => {
    const passwordRoute = async (req, res) => {
        res.render("generatePassword");
    };

    const updatePassword = async (req, res) => {
        const { name, oldPassword, newPassword } = req.body;
        // hash the newPassword using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const details = {
            name,
            oldPassword,
            hashedPassword
        };

        // insert the new hashedPassword into the database
        const updatedPassword = await logic.updateUserPassword(details);

        if (updatedPassword === null) {
            req.flash("error", "Username not registered.");
            // redirect to the sign up page
            res.redirect("/signUp");
        } else if (updatedPassword === true) {
            req.flash("success", "New password created.");
            // redirect to the home page
            res.redirect("/");
        } else {
            req.flash("error", "Password incorrect");
            // Stay on the generatePassword page
            res.redirect("/generatePassword");
        };
    };

    return {
        passwordRoute,
        updatePassword
    }
};

export default generatePassword;