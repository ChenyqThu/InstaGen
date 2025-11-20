# Vercel Deployment Guide for InstaGen

This guide explains how to deploy the InstaGen application to Vercel.

## Prerequisites

1.  A [GitHub](https://github.com/), [GitLab](https://gitlab.com/), or [Bitbucket](https://bitbucket.org/) account.
2.  A [Vercel](https://vercel.com/) account.
3.  Your Gemini API Key.

## Architecture 🏗️

This project uses **Vercel Serverless Functions** to handle API requests.
-   **Frontend**: React (Vite)
-   **Backend**: Node.js Serverless Function (`api/generate.js`)

This architecture ensures your **API Key is secure** and never exposed to the client browser.

## Deployment Steps

### 1. Push to Git

Ensure your project is pushed to a remote repository (GitHub, GitLab, etc.).

### 2. Import Project in Vercel

1.  Log in to your Vercel Dashboard.
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your `InstaGen` repository and click **"Import"**.

### 3. Configure Project

Vercel should automatically detect that this is a **Vite** project.

-   **Framework Preset**: Vite
-   **Root Directory**: `./` (default)
-   **Build Command**: `vite build` (default)
-   **Output Directory**: `dist` (default)

### 4. Configure Environment Variables

1.  Expand the **"Environment Variables"** section.
2.  Add a new variable:
    *   **Key**: `GEMINI_API_KEY`
    *   **Value**: Your actual Gemini API Key (starts with `AIza...`)
4.  Add Supabase variables (see `SUPABASE_SETUP.md`):
    *   **Key**: `VITE_SUPABASE_URL`
    *   **Value**: Your Supabase Project URL
    *   **Key**: `VITE_SUPABASE_ANON_KEY`
    *   **Value**: Your Supabase Anon Key
5.  Click **"Add"**.

> **Note**: The backend function (`api/generate.js`) reads `process.env.GEMINI_API_KEY` on the server side.

### 5. Deploy

1.  Click **"Deploy"**.
2.  Wait for the build to complete.

## Troubleshooting

-   **API Errors (500)**: Check the "Functions" logs in your Vercel Dashboard. It usually means the `GEMINI_API_KEY` is missing or invalid.
-   **CORS Errors**: The API is configured to allow all origins (`*`) for simplicity, but ensure your frontend is calling `/api/generate` correctly.
