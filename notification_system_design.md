# Campus Notification System Design

## Overview

The Campus Notification System is designed to manage and prioritize notifications for students in a scalable and efficient way.

The system handles:

* Placement notifications
* Event announcements
* Academic updates
* Results and examination alerts
* Emergency notifications

The backend service fetches notifications from an external API, calculates priority scores, and returns the most important notifications to users.

---

# Architecture Design

## Components

### 1. Notification API Service

Responsible for:

* Fetching notifications
* Processing notification data
* Applying ranking logic
* Returning prioritized notifications

### 2. Logging Middleware

Tracks:

* API calls
* Errors
* Service events
* Notification processing activities

### 3. Priority Engine

Calculates notification importance using:

* Notification type
* Recency
* Title keywords

### 4. Client Applications

Students can access notifications using:

* Web applications
* Mobile applications

---

# API Design

## Fetch Notifications

### Endpoint

```http
GET /notifications
```

### Response

```json
{
  "success": true,
  "totalFetched": 50,
  "topNotifications": []
}
```

---

# Priority Calculation Logic

Notifications are ranked using a custom score.

## Factors Considered

### Notification Type

| Type      | Score |
| --------- | ----- |
| Placement | 80    |
| Result    | 60    |
| Event     | 40    |
| Others    | 20    |

---

### Recency Score

| Published Time  | Score |
| --------------- | ----- |
| Within 12 Hours | 50    |
| Within 48 Hours | 30    |
| Within 96 Hours | 15    |
| Older           | 5     |

---

### Keyword Boosting

Additional score is added for important keywords:

* urgent
* interview
* exam
* deadline

---

# Database Design

## Users Table

| Column     | Type    |
| ---------- | ------- |
| userId     | INT     |
| name       | VARCHAR |
| email      | VARCHAR |
| department | VARCHAR |

---

## Notifications Table

| Column         | Type     |
| -------------- | -------- |
| notificationId | INT      |
| title          | VARCHAR  |
| description    | TEXT     |
| type           | VARCHAR  |
| timestamp      | DATETIME |

---

## UserNotification Table

| Column         | Type    |
| -------------- | ------- |
| id             | INT     |
| userId         | INT     |
| notificationId | INT     |
| isRead         | BOOLEAN |

---

# SQL Optimization

Indexes improve query performance.

## Recommended Indexes

```sql
CREATE INDEX idx_user_notifications
ON UserNotification(userId);
```

```sql
CREATE INDEX idx_notification_type
ON Notifications(type);
```

---

# Scalability Strategy

The system supports large-scale notification processing.

## Techniques Used

### Horizontal Scaling

Multiple backend instances can run behind a load balancer.

### Caching

Redis can cache:

* recent notifications
* unread counts

### Queue Processing

Notification processing can be handled asynchronously using:

* RabbitMQ
* Kafka

---

# Asynchronous Processing Flow

1. Notification received
2. Notification enters queue
3. Worker processes notification
4. Priority calculated
5. Notifications delivered to users

Benefits:

* Better performance
* Reduced API response time
* Improved scalability

---

# Security Considerations

The system uses:

* Bearer Token Authentication
* Input validation
* Secure API communication
* Error handling

---

# Backend Implementation

A backend notification service was implemented using:

* Node.js
* Express.js
* Axios

Features implemented:

* External API integration
* Notification ranking
* Sorting based on priority
* Logging middleware
* JSON response generation

---

# Conclusion

The proposed notification system is scalable, efficient, and suitable for campus-wide communication systems.

The design supports:

* notification prioritization
* asynchronous processing
* scalable deployment
* optimized querying
* secure API communication
