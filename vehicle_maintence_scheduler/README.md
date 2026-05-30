
# Vehicle Maintenance Scheduler

## Description

This backend service optimizes vehicle maintenance scheduling for depots based on available mechanic hours and vehicle task impact.

The service:

* Fetches depot data
* Fetches vehicle maintenance tasks
* Optimizes task allocation
* Maximizes total maintenance impact
* Uses logging middleware for monitoring

---

## Technologies Used

* Node.js
* Express.js
* Axios
* dotenv
* cors

---

## Algorithm Used

A greedy optimization strategy based on:
Impact / Duration ratio

Tasks with higher efficiency are prioritized first.

---

## Features

* Protected API integration
* Dynamic scheduling
* Logging middleware integration
* Error handling
* Console monitoring logs

---

## Run Project

Install dependencies:

```bash
npm install
```

Start server:

```bash
node server.js
```

---

## API Endpoint

GET

```bash
http://localhost:5000/schedule
```

---

## Output

Returns optimized maintenance schedules for all depots.
=======
# 234G1A0597

