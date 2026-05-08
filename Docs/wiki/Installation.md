# Installation

This page explains how to install and run **TissuLuxe** in a local development environment.

---

## Requirements

Make sure the following tools are installed:

- Git
- Node.js
- npm
- MySQL
- A modern browser

---

## Clone the Repository

```bash
git clone https://github.com/amine-elkartite/tissuluxe.git
cd tissuluxe
```

---

## Install Dependencies

If the project uses Node.js dependencies, install them with:

```bash
npm install
```

If the frontend and backend are separated, install dependencies inside the required folders.

---

## Database Setup

Create a local database for the project and import the available SQL file if it exists in the repository.

Recommended steps:

1. Create a new MySQL database.
2. Import the database schema.
3. Configure the backend database connection locally.
4. Start the backend server.

---

## Run the Project

```bash
npm start
```

Or run the backend server according to the project structure.

---

## Development Notes

- Do not commit private configuration files.
- Keep credentials outside the public repository.
- Use `.gitignore` for unnecessary files.
- Test the website on desktop, tablet, and mobile screens.

---

## Back to Wiki

Return to [Home](Home.md).
