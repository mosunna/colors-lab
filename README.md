# COLORS — LAMP Stack Web Application

## Description

COLORS is a small full-stack web application built for the COP 4331 "COLORS Lab" assignment. It demonstrates a complete LAMP stack (Linux, Apache, MySQL, PHP) deployment: a user logs in, then can add color names to their personal list and search that list back out.

The application has two parts:

- A **front end** (`public/`) — static HTML pages styled with CSS, with JavaScript handling login, logout, adding colors, and searching colors via AJAX calls to the back end.
- A **back end API** (`api/`) — three PHP endpoints that talk to a MySQL database: `Login.php`, `AddColor.php`, and `SearchColors.php`.

Passwords are hashed client-side with MD5 before being sent to the server (see `public/js/md5.js`), and compared against MD5 hashes stored in the `Users` table.

## Technologies Used

- **Linux** — Ubuntu 24.04 (via a DigitalOcean droplet)
- **Apache** — web server
- **MySQL** — relational database (`Users`, `Colors`, and `Contacts` tables)
- **PHP** (with `mysqli`, prepared statements) — API endpoints
- **HTML / CSS / JavaScript** — front end, including a client-side MD5 implementation ([blueimp/JavaScript-MD5](https://github.com/blueimp/JavaScript-MD5))

## Repository Structure

```
colors-lamp/
├── api/
│   ├── Login.php
│   ├── AddColor.php
│   ├── SearchColors.php
│   └── config.php.example   # template for DB credentials — copy to config.php and fill in
├── public/
│   ├── index.html           # login page
│   ├── color.html           # logged-in page: add/search colors
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── code.js          # front-end application logic
│       └── md5.js           # client-side MD5 hashing library
├── README.md
├── LICENSE.md
└── .gitignore
```

## High-Level Setup Instructions

These instructions assume a fresh Linux server with Apache, MySQL, and PHP already installed (a "LAMP stack"), such as DigitalOcean's LAMP on Ubuntu marketplace image.

1. **Create the database and tables.** Connect to MySQL (`mysql -u root -p`) and create a database (e.g. `COP4331`) with three tables: `Users` (ID, FirstName, LastName, Login, Password), `Colors` (ID, Name, UserID), and `Contacts` (ID, FirstName, LastName, Phone, Email, UserID). Create a dedicated MySQL user for the application (rather than using `root`) and grant it privileges on that database only.

2. **Deploy the API.** Copy the contents of `api/` into your web root (e.g. `/var/www/html/LAMPAPI/`). Copy `config.php.example` to `config.php` in that same directory and fill in your actual database host, username, password, and database name. `config.php` is intentionally excluded from version control (see `.gitignore`) since it holds real credentials.

3. **Deploy the front end.** Copy the contents of `public/` into your web root (e.g. `/var/www/html/`).

4. **Point the front end at the API.** In `public/js/code.js`, `urlBase` is set to a relative path (`/LAMPAPI`), so it automatically works whether the site is accessed by IP address or by domain name, over HTTP or HTTPS — no code changes needed for different deployments.

5. **Populate sample data.** Insert at least one row into `Users` with an MD5-hashed password (e.g. via `INSERT INTO Users (FirstName,LastName,Login,Password) VALUES ('Jane','Doe','jdoe', MD5('somepassword'));`) so you have credentials to log in with.

## How to Run and Access the Application

Once deployed, open a web browser and navigate to the server's domain or IP address (e.g. `http://your-server-ip/` or `https://yourdomain.com/`). You'll land on the login page (`index.html`). Log in with a valid username/password to reach the color list page (`color.html`), where you can:

- **Search** for colors already saved under your account (partial matches supported).
- **Add** a new color, which is saved to the database under your user ID.

Logging out returns you to the login page.

## Assumptions, Limitations, and AI Usage

**Assumptions / Limitations:**

- This is a learning-lab project, not production-hardened software. Passwords are hashed with MD5, which is not considered cryptographically secure for real-world applications — a stronger algorithm (e.g. bcrypt/Argon2) would be used in production.
- There is no user registration flow in this version; user accounts are provisioned directly in the database.
- The `Contacts` table exists in the schema but is not yet used by any front-end page or API endpoint in this version.
- Error handling is minimal and intended for demonstration purposes (e.g., the front end shows a generic "incorrect" message rather than distinguishing between a wrong password and a server/database error).

**AI Usage:** AI assistance (Claude) was used during deployment and debugging — for example, troubleshooting SSH/console access to the server, diagnosing a CORS/same-origin issue after connecting a custom domain, and recovering from a corrupted file paste in the browser-based server console — and to help organize this existing project into a version-controlled repository following the structure and commit-hygiene practices described above. The application's design, database schema, and implementation were completed as part of the COP 4331 COLORS Lab coursework.
