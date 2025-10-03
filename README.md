# GrowthKit

A gamified platform offering curated, interactive marketing tools unlocked by earning credits through community contributions.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/nocodeworkflows/growthKit)

GrowthKit is a full-stack web application that hosts a curated collection of gated, gamified marketing tools. It transforms top-performing lead magnets (like templates, calculators, and generators) into interactive mini-SaaS applications. Users access these tools through a credit-based system, earning credits by contributing new lead magnets for audit, reviewing existing tools, or sharing them on social media. The platform aims to create a self-sustaining ecosystem where marketers can discover high-quality tools and contribute to the community's growth.

## Key Features

-   **User Authentication:** Secure email/password and optional OAuth (Google, LinkedIn) sign-up and login.
-   **Credit-Based Economy:** Unlock valuable marketing tools using credits earned through platform participation.
-   **Interactive Tool Library:** Access a curated collection of mini-SaaS apps, not just static templates.
-   **Community Contribution:** Users can submit new tools, review existing ones, and share content to earn credits.
-   **Gamified Experience:** The credit system encourages engagement and rewards active users.
-   **Admin Panel:** Manage tool submissions, user activity, and the credit economy.
-   **Modern, Responsive UI:** A clean, minimal, and mobile-first design built for an excellent user experience.

## Technology Stack

-   **Frontend:** React, Vite, TypeScript
-   **Backend:** Hono on Cloudflare Workers
-   **State Management:** Zustand
-   **Styling:** Tailwind CSS
-   **UI Components:** shadcn/ui
-   **Forms:** React Hook Form & Zod
-   **Routing:** React Router
-   **Animations:** Framer Motion
-   **Icons:** Lucide React

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
-   Wrangler CLI installed and configured: `bun install -g wrangler`.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd growthkit
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

### Running the Application Locally

To start the development server for both the frontend and the local Cloudflare Worker, run:

```bash
bun run dev
```

This will start the Vite development server, typically on `http://localhost:3000`, with live reloading for the frontend and backend.

## Project Structure

The project is organized into three main directories:

-   `src/`: Contains the frontend React application, including pages, components, hooks, and utility functions.
-   `worker/`: Contains the backend Hono application that runs on Cloudflare Workers. This is where API routes and business logic are defined.
-   `shared/`: Contains TypeScript types and interfaces that are shared between the frontend and the backend to ensure type safety.

## Development

### Frontend

The frontend is a standard Vite + React application. All components are located in `src/components`, pages in `src/pages`, and global state management in `src/lib`. We use `shadcn/ui` for our component library, so prefer using existing components from `src/components/ui` over creating new ones.

### Backend

The backend is built with Hono and runs on Cloudflare Workers. API endpoints are defined in `worker/user-routes.ts`. The application uses a single global Durable Object for stateful storage, abstracted via `IndexedEntity` classes defined in `worker/entities.ts`.

To add a new API endpoint:
1.  Define the route in `worker/user-routes.ts`.
2.  Create or modify entity classes in `worker/entities.ts` for data persistence.
3.  Add any necessary shared types to `shared/types.ts`.

## Deployment

This project is designed for seamless deployment to Cloudflare Pages.

### Manual Deployment with Wrangler

1.  **Build the project:**
    ```bash
    bun run build
    ```

2.  **Deploy to Cloudflare:**
    ```bash
    bun run deploy
    ```

This command will build the application and deploy it using the Wrangler CLI according to the configuration in `wrangler.jsonc`.

### One-Click Deploy

You can also deploy this project to Cloudflare with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/nocodeworkflows/growthKit)