const axios = require("axios");

const createLog = async (
    stackType,
    levelType,
    packageType,
    logMessage,
    token
) => {

    try {

        await axios.post(
            "http://4.224.186.213/evaluation-service/logs",
            {
                stack: stackType,
                level: levelType,
                package: packageType,
                message: logMessage
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

    } catch (error) {

        console.log("Logger Error");
    }
};

module.exports = createLog;