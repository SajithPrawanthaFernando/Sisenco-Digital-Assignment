# Expense Tracker API

## Overview

The Expense Tracker API is a robust backend system for managing personal finances. It allows users to track expenses, manage budgets, set financial goals, and generate reports. The system also provides real-time notifications for budget alerts, recurring transactions, and savings allocations.

## Features

- **User Authentication**: Register, login, update profiles, and manage user roles.
- **Expense & Income Tracking**: Add, update, delete, and retrieve transactions.
- **Budget Management**: Create, view, and update budgets with monthly limits.
- **Goal Management**: Set and track financial goals with progress notifications.
- **Reports**: Generate reports for transactions, budgets, and financial trends.
- **Notifications**: WebSocket and stored notifications for budget alerts, recurring transactions, and goal updates.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT)
- **Real-time Communication**: Socket.io
- **Background Jobs**: Node-cron
- **Testing**: Jest, Supertest, Artillery.io (Load Testing)
- **API Documentation**: Postman Collection

## API Endpoints

### Authentication

- **Register User**: `POST /auth/register`
- **Login User**: `POST /auth/login`
- **Update User Profile**: `PUT /auth/update`
- **Get User Profile**: `GET /auth/profile`
- **Delete User**: `DELETE /auth/delete`

### Transactions

- **Create Transaction**: `POST /transactions/createtransaction`
- **Get All Transactions**: `GET /transactions/getalltransaction`
- **Filter Transactions**: `GET /transactions/getalltransaction?category=Food&dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD`
- **Update Transaction**: `PUT /transactions/updatetransaction/{transactionId}`
- **Delete Transaction**: `DELETE /transactions/deletetransaction/{transactionId}`

### Budget Management

- **Create Budget**: `POST /budget/createbudget`
- **Get Budgets**: `GET /budget/getbudget?month=YYYY-MM`
- **Update Budget**: `PUT /budget/updatebudget/{budgetId}`
- **Delete Budget**: `DELETE /budget/deletebudget/{budgetId}`

### Goals Management

- **Create Goal**: `POST /goals/creategoal`
- **Get Goals**: `GET /goals/getgoals`
- **Update Goal**: `PUT /goals/updategoals/{goalId}`
- **Delete Goal**: `DELETE /goals/deletegoals/{goalId}`

### Notifications

- **Get Notifications**: `GET /notifications/getnotifications`
- **Mark as Read**: `PUT /notifications/mark-read/{notificationId}`
- **Delete Notification**: `DELETE /notifications/deletenotification/{notificationId}`

### **System Settings**

- **Get Categories**: `GET /settings/categories`
- **Add Category**: `POST /settings/addcategories`
- **Update Category**: `PUT /settings/categories/{categoryId}`
- **Delete Category**: `DELETE /settings/categories/{categoryId}`

### **Monthly Balance**

- **Get User Monthly Balance**: `GET /balance/monthlybalance`

### **Financial Reports**

- **Income vs Expense Summary**: `GET /summary/income-vs-expense?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- **Budget Summary**: `GET /summary/budget-summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- **Goal Summary**: `GET /summary/goal-summary`

## Real-Time Features

- WebSocket integration for:
  - **Spending Alerts**
  - **Budget Recommendations**
  - **Recurring Transaction Updates**
  - **Goal Progress Alerts**
  - **Monthly Savings Allocations**

## Background Jobs (Cron Jobs)

- **Recurring Transactions Processing** - Runs daily to process recurring expenses/income.
- **Goal Completion Notifications** - Runs daily to notify users of near-completion goals.
- **Budget Exceeding Alerts** - Runs monthly to alert users if they overspend their budget.
- **Monthly Savings Allocation** - Runs monthly to allocate savings towards financial goals.

## Installation

### Prerequisites

- Node.js installed (v14+ recommended)
- MongoDB database

### Steps to Run

1. Clone the repository:<br/>
   `git clone https://github.com/SajithPrawanthaFernando/Sisenco-Digital-Assignment.git` <br/>
   ` cd server`

2. Install dependencies:
   `npm install`
3. Create a `.env` file and configure database and JWT settings:<br/>
   PORT=`your_port`<br/>
   MONGO_URI=`your_databaseb_url`<br/>
   JWT_SECRET=`your_jwt_secret`

4. Start the server:
   ` npm start`

## Contributing

Feel free to submit pull requests or issues for improvements.

## License

This project is licensed under the MIT License.
