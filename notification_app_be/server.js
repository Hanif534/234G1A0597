require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const createLog = require("../logging_middleware/logger");
const app = express();

app.use(cors());
app.use(express.json());

/*
========================================
LOG FUNCTION
========================================
*/

async function Log(stack, level, packageName, message) {

    try {

        await axios.post(
            "http://4.224.186.213/evaluation-service/logs",
            {
                stack: stack,
                level: level,
                package: packageName,
                message: message
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.TOKEN}`
                }
            }
        );

    } catch (error) {

        console.log("Logging Failed");
    }
}

/*
========================================
PRIORITY SCORE FUNCTION
========================================
*/

function calculatePriority(notification) {

    let score = 0;

    // Type Weight
    if (notification.Type === "Placement") {
        score += 50;
    }
    else if (notification.Type === "Result") {
        score += 40;
    }
    else if (notification.Type === "Event") {
        score += 30;
    }

    // Recency Weight
    let currentTime = new Date();

    let notificationTime = new Date(notification.Timestamp);

    let differenceHours =
        (currentTime - notificationTime) / (1000 * 60 * 60);

    if (differenceHours <= 24) {
        score += 30;
    }
    else if (differenceHours <= 72) {
        score += 20;
    }
    else {
        score += 10;
    }

    return score;
}

/*
========================================
GET PRIORITY NOTIFICATIONS
========================================
*/

app.get("/notifications", async (req, res) => {

    try {

        console.log("Fetching notifications...");

        await Log(
            "backend",
            "info",
            "route",
            "Notifications endpoint called"
        );

        const response = await axios.get(
            "http://4.224.186.213/evaluation-service/notifications",
            {
                headers: {
                    Authorization: `Bearer ${process.env.TOKEN}`
                }
            }
        );

        console.log("Notifications fetched successfully");

        let notifications = response.data.notifications;

        console.log("Calculating priority scores...");

        // Add score to each notification
        notifications = notifications.map((notification) => {

            return {
                ...notification,
                priorityScore: calculatePriority(notification)
            };
        });

        console.log("Sorting notifications...");

        // Sort highest priority first
        notifications.sort((a, b) => {

            return b.priorityScore - a.priorityScore;
        });

        // Top 10 notifications
        let topNotifications = notifications.slice(0, 10);

        console.log("Top notifications prepared");

        await Log(
            "backend",
            "info",
            "service",
            "Priority notifications generated successfully"
        );

        res.status(200).json({
            success: true,
            totalNotifications: notifications.length,
            topNotifications: topNotifications
        });

    } catch (error) {

        console.log("Server Error:", error.message);

        await Log(
            "backend",
            "error",
            "handler",
            error.message
        );

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/*
========================================
START SERVER
========================================
*/

app.listen(process.env.PORT, () => {

    console.log(`Notification Server running on port ${process.env.PORT}`);
});