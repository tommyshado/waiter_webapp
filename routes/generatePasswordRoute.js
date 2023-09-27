const generatePassword = (logic, bcrypt) => {
    const passwordRoute = async (req, res) => {
        res.render("generatePassword");
    };

    const updatePassword = async (req, res) => {
        const { name, oldPassword, newPassword } = req.body;
        // hash the newPassword using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        const password = await logic.getPassword({
            name,
            oldPassword,
            hashedPassword,
        });

        if (password) {
            bcrypt.compare(oldPassword, password.password).then(async (result) => {
                if (result) {
                    // insert the new hashedPassword into the database
                    await logic.updateUserPassword({
                        password,
                        hashedPassword,
                    });
                    req.flash("success", "New password created.");
                    // redirect to the home page
                    res.redirect("/");
                }
                else if (!result) {
                    req.flash("error", "Password incorrect");
                    // Stay on the generatePassword page
                    res.redirect("/generatePassword");
                }
            });
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
