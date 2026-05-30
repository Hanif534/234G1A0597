const axios = require("axios");

async function Log(stack, level, packageName, message, token) {
  try {
    await axios.post(
      "http://4.224.186.213/evaluation-service/logs",
      {
        stack,
        level,
        package: packageName,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.log("Logging failed");
  }
}

module.exports = Log;