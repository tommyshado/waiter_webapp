const generatePassword = (logic, bcrypt) => {
    const passwordRoute = async (req, res) => {
        res.render("generatePassword");
    };

    const updatePassword = async (req, res) => {
        const { name, newPassword } = req.body;
        // hash the newPassword using bcrypt
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const password = await logic.getPassword(name);

        if (password) {
            // insert the new hashedPassword into the database
            await logic.updateUserPassword({
                password,
                hashedPassword,
            });
            req.flash("success", "New password created.");
            // redirect to the home page
            res.redirect("/");

        } else {
            req.flash("error", "Username not registered.");
            // redirect to the sign up page
            res.redirect("/signUp");
        }
    };

    return {
        passwordRoute,
        updatePassword,
    };
};

export default generatePassword;
