
const regexPatternTest = name => {
    const regexPattern = /^[a-zA-Z]+$/;
    const regexPatternTest = regexPattern.test(name);
    return regexPatternTest;
};

export default regexPatternTest;