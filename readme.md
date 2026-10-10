# 🚀 JobSite Platform

Welcome to the central repository for the JobSite platform. This project is a next-generation career portal designed to seamlessly connect top talent with industry-leading employers through advanced matching algorithms.

## 🏗️ System Architecture

This repository is structured as a monorepo, encompassing the frontend, backend, and mobile applications to ensure a unified, full-stack TypeScript environment. 

### 💻 Tech Stack

*   **Frontend (Web):** Next.js (React), TypeScript, Tailwind CSS
*   **Mobile App:** React Native (Expo), TypeScript
*   **Backend (API):** Node.js with NestJS
*   **Database:** PostgreSQL (Relational & JSONb data)
*   **Search & Matching Engine:** Typesense / Elasticsearch
*   **Infrastructure:** Docker, GitHub Actions (CI/CD)

## 📁 Repository Structure

```text
JobSite/
├── apps/
│   ├── web/               # Next.js web application
│   ├── mobile/            # React Native Android/iOS app
│   └── api/               # NestJS backend API services
├── packages/
│   ├── ui/                # Shared React UI components
│   ├── config/            # Shared ESLint/TypeScript configs
│   └── database/          # PostgreSQL schema and migrations
├── docker-compose.yml     # Local development orchestration
└── README.md              # Project documentation
```

## 🛠️ Prerequisites

To run this environment locally, ensure you have the following installed on your machine:

*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/)
*   [PostgreSQL](https://www.postgresql.org/)
*   [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)

## 🚀 Getting Started (Development)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/anuanjani/JobSite.git
    cd JobSite
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Spin up the infrastructure (Database & Search Engine):**
    ```bash
    docker-compose up -d
    ```

4.  **Start the development servers:**
    ```bash
    npm run dev
    ```

## 📜 License

This project is proprietary and confidential.