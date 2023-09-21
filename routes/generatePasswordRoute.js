

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

        if (updatedPassword === "not registered") {
            req.flash("error", "Username not registered.");
            // redirect to the sign up page
            res.redirect("/signUp");
        } else {
            req.flash("success", "New password created.");
            // redirect to the home page
            res.redirect("/");
        };
    };

    return {
        passwordRoute,
        updatePassword
    }
};

export default generatePassword;