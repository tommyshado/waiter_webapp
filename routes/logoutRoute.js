const logoutRoute = () => {
    // Logout route
    const logout = async (req, res) => {
        // Destroy the session to log out the user
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
            };
            // Redirect to the login page after logout
            res.redirect("/");
        });
    };

    return {
        logout
    };
};

export default logoutRoute;
