A modern, enterprise-ready Task Management System built with Angular 17, .NET Core 8 Web API, and SQL Server, featuring Azure Active Directory Integration, task dependencies, multi-user comments, and automated weekly reporting.

🚀 Overview

This system allows teams to manage tasks collaboratively while integrating directly with Azure AD for user identity and reporting. It includes:

Task creation and editing

Assigning dependencies to Azure AD users

Threaded comments per task

Weekly DOCX report generation and automated emailing

Clean Angular UI with real-time People Picker

Secure, scalable backend built with ASP.NET Core 8

🧱 Tech Stack
Frontend

Angular 17

TypeScript (strict mode)

SCSS styling

Custom People Picker (Azure AD users)

Reactive Forms + HttpClient

Backend

ASP.NET Core 8 Web API

EF Core 8 (SQL Server)

Repository & Service Layer

Microsoft Graph API (Azure AD)

OpenXML report generator

Azure Communication Services / SendGrid (email)

Database

SQL Server (Local development)

Azure SQL Database (Deployment)

AI Development Support

Google Anti-Gravity / IDX / Gemini Code Assist

📌 Features
✔ Task Management

Create, view, update, delete tasks

Track status: New, In Progress, Completed, Blocked

Assign project categories

Set start, due, and completion dates

✔ Azure AD People Picker

Search Azure AD users dynamically

Assign dependencies directly to existing directory users

Cached name + email values stored for reporting

✔ Task Comments (Multi-User)

Add multiple comments per task

Each comment tagged with Azure AD user identity

Real-time updates

Clean comment UI with timestamps

✔ Automated Weekly Reporting

Azure Function runs every Friday (configurable)

Pulls weekly task activity

Generates DOCX report using OpenXML

Emails report to supervisor (e.g., boss@example.com)

Includes:

Tasks In Progress

Completed Tasks

Dependencies

Comments

✔ Cloud Ready

Frontend → Azure Static Web Apps / App Service

API → Azure App Service

DB → Azure SQL

Email → Azure Communication Services / SendGrid

🏗️ Architecture
+----------------------+       +-------------------------+
|     Angular 17       | <---> | ASP.NET Core 8 API      |
| (UI + People Picker) |       | (Tasks, Comments, AD)   |
+----------------------+       +-------------------------+
              |                          |
              |   REST API               |   EF Core
              |                          |
+----------------------+       +-------------------------+
|  Azure Active Dir    |       |      SQL Server         |
|  (User Directory)    |       | Tasks, Comments, Users  |
+----------------------+       +-------------------------+

📁 Project Structure
Backend
TaskManagement.Api/
TaskManagement.Core/
TaskManagement.Infrastructure/

Frontend
task-manager/
 └── src/
      ├── app/
      │    ├── modules/tasks/
      │    ├── components/people-picker/
      │    ├── components/comment-box/
      │    └── services/
      └── assets/

⚙️ Setup
Backend

Update connection string in appsettings.Development.json

Apply migrations:

dotnet ef database update


Run API:

dotnet run

Frontend

Install dependencies:

npm install


Update environment.ts with API URL

Start development server:

ng serve

🧪 Testing

Angular unit tests (Jasmine/Karma)

.NET API tests (xUnit/MSTest)

Integration tests using EF Core InMemory

🚀 Deployment
Azure

Angular → Static Web Apps or App Service

API → Azure App Service

SQL → Azure SQL

Email → Azure Communication Services or SendGrid

Weekly Reports → Azure Functions (Timer Trigger)