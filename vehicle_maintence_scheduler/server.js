require("dotenv").config();
const createLog = require("../logging_middleware/logger");
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMzRnMWEwNTk3QHNyaXQuYWMuaW4iLCJleHAiOjE3ODAxMTkwMjYsImlhdCI6MTc4MDExODEyNiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjhmMGY2NTIzLWQwN2MtNDNhZC04OWVkLWI4YzllMmNlMmJlYiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6Im1vaGFtbWFkIGhhbmlmIiwic3ViIjoiNDJhMGVjNjgtZjE1Mi00ZDY5LTk4OTUtN2RmZDAxODFlZGI0In0sImVtYWlsIjoiMjM0ZzFhMDU5N0Bzcml0LmFjLmluIiwibmFtZSI6Im1vaGFtbWFkIGhhbmlmIiwicm9sbE5vIjoiMjM0ZzFhMDU5NyIsImFjY2Vzc0NvZGUiOiJTZGtqSkciLCJjbGllbnRJRCI6IjQyYTBlYzY4LWYxNTItNGQ2OS05ODk1LTdkZmQwMTgxZWRiNCIsImNsaWVudFNlY3JldCI6Ik5ZdGpZVUNlYnhzclhrZmMifQ.ZeOAYCXh_vz7B5QzS5C85ueap0Hq0mp2v0wsbj3kQas";

/*
========================================
LOGGING FUNCTION
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
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

    } catch (error) {

        console.log("Logging Failed");
    }
}

/*
========================================
GET AUTH TOKEN
========================================
*/

async function getAuthToken() {

    try {

        console.log("Generating authentication token...");

        const response = await axios.post(
            "http://4.224.186.213/evaluation-service/auth",
            {
                email: process.env.EMAIL,
                name: process.env.NAME,
                rollNo: process.env.ROLL_NO,
                accessCode: process.env.ACCESS_CODE,
                clientID: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET
            }
        );

        accessToken = response.data.access_token;

        console.log("Token Generated Successfully");

        await Log(
            "backend",
            "info",
            "auth",
            "Authentication token generated successfully"
        );

    } catch (error) {

        console.log("Authentication Error:", error.message);
    }
}

/*
========================================
TASK OPTIMIZATION LOGIC
========================================
*/

function optimizeTasks(tasks, maxHours) {

    console.log("Starting optimization process...");

    // Clone original tasks
    let sortedTasks = [...tasks];

    // Sort by impact efficiency
    sortedTasks.sort((a, b) => {

        let firstRatio = a.Impact / a.Duration;
        let secondRatio = b.Impact / b.Duration;

        return secondRatio - firstRatio;
    });

    let selectedTasks = [];

    let usedHours = 0;

    let totalImpact = 0;

    for (let task of sortedTasks) {

        console.log(`Checking Task -> ${task.TaskID}`);

        // Check if task can fit
        if (usedHours + task.Duration <= maxHours) {

            selectedTasks.push(task);

            usedHours += task.Duration;

            totalImpact += task.Impact;

            console.log(
                `Task Added | Duration: ${task.Duration} | Impact: ${task.Impact}`
            );

        } else {

            console.log("Task Skipped due to insufficient hours");
        }
    }

    console.log("Optimization Completed");

    return {
        totalImpact: totalImpact,
        selectedTasks: selectedTasks,
        usedHours: usedHours
    };
}

/*
========================================
MAIN API
========================================
*/

app.get("/schedule", async (req, res) => {

    try {

        console.log("Schedule API Called");

        await Log(
            "backend",
            "info",
            "route",
            "Schedule endpoint accessed"
        );

        /*
        ========================
        FETCH DEPOTS
        ========================
        */

        console.log("Fetching depot data...");

        const depotResponse = await axios.get(
            "http://4.224.186.213/evaluation-service/depots",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        console.log("Depot data fetched successfully");

        /*
        ========================
        FETCH VEHICLES
        ========================
        */

        console.log("Fetching vehicle maintenance tasks...");

        const vehicleResponse = await axios.get(
            "http://4.224.186.213/evaluation-service/vehicles",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        console.log("Vehicle task data fetched successfully");

        const depots = depotResponse.data.depots;

        const vehicles = vehicleResponse.data.vehicles;

        await Log(
            "backend",
            "info",
            "service",
            "Fetched depot and vehicle data successfully"
        );

        /*
        ========================
        PROCESS EACH DEPOT
        ========================
        */

        console.log("Starting maintenance scheduling...");

        let finalResult = [];

        for (let depot of depots) {

            console.log(`Processing Depot ID: ${depot.ID}`);

            const optimizedData = optimizeTasks(
                vehicles,
                depot.MechanicHours
            );

            finalResult.push({
                depotId: depot.ID,
                mechanicHours: depot.MechanicHours,
                usedHours: optimizedData.usedHours,
                totalImpact: optimizedData.totalImpact,
                selectedTasks: optimizedData.selectedTasks
            });

            console.log(`Depot ${depot.ID} processed successfully`);
        }

        console.log("All depots processed successfully");

        await Log(
            "backend",
            "info",
            "service",
            "Optimization completed successfully"
        );

        /*
        ========================
        SEND RESPONSE
        ========================
        */

        res.status(200).json({
            success: true,
            message: "Vehicle maintenance schedule generated successfully",
            data: finalResult
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
            message: "Something went wrong",
            error: error.message
        });
    }
});

/*
========================================
START SERVER
========================================
*/

app.listen(process.env.PORT, async () => {

    console.log("Starting Server...");

    await getAuthToken();

    console.log(`Server running on port ${process.env.PORT}`);
});