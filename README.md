# Afterlight

**A home for the stories we keep.**

Afterlight is a personal memory journal for preserving meaningful stories, people, dates, and the little details that are easy to forget. It gives each memory a place of its own, so users can return to the moments and stories they want to hold on to.

> Some stories deserve more than a place in our minds. They deserve a place to stay.

**Live demo:**  [afterlight-kohl-iota.vercel.app](https://afterlight-kohl-iota.vercel.app/)

**Source code:**  [github.com/pratikraut8889-max/afterlight.git](https://github.com/pratikraut8889-max/afterlight.git)

> **Project status:** Working MVP. Memory creation, listing, editing, deletion, and MongoDB persistence have been tested. Authentication, per-user access control, and the planned AI features are not yet included in the implementation described here.

## Features

### Currently implemented

- Create a memory with a title, person's name, relationship, story, and optional date.
- Record favourite things such as songs, food, places, or habits.
- Browse saved memories in the Memory Keeper interface.
- Edit and delete existing memories.
- Persist memories in MongoDB so they remain available after a page refresh.
- Use Angular signals to keep the memory list reactive.
- Responsive interface styled with Tailwind CSS.
- Express API served alongside the Angular SSR application in the Node.js server.

### Planned

- User registration and sign-in.
- Private, per-user memory ownership and authorization.
- Photo and audio attachments.
- Search, filtering, and a chronological memory timeline.
- Optional AI-assisted writing prompts and story organization using an open-weight model.
- Private family collections and controlled sharing.
- User data export and account deletion.

Planned features are not currently available unless they have since been implemented in the repository.

## Tech stack

| Layer     | Technology                                             |
| --------- | ------------------------------------------------------ |
| Frontend  | Angular (standalone components, routing, signals)      |
| Rendering | Angular SSR                                            |
| Styling   | Tailwind CSS                                           |
| API       | Node.js and Express.js                                 |
| Database  | MongoDB Atlas                                          |
| ODM       | Mongoose                                               |
| Data flow | Angular `HttpClient` service calling the Express API |

The application is designed as a single Node.js application: Express handles API requests, while Angular handles the user interface and server-side rendering. MongoDB stores memory records.

## Architecture overview

```text
Browser
  |
  v
Angular application
  |  Angular SSR
  |  Memories API service
  v
Node.js server (src/server.ts)
  |
  +---- /api/health
  |
  +---- /api/memories
  |       Express routes
  |          |
  |          v
  |       Mongoose model
  |          |
  |          v
  |       MongoDB Atlas
  |
  +---- Angular SSR handler
```

The exact deployment adapter and routing configuration may differ from the local development setup. Keep the Vercel configuration in sync with the current SSR server entry point.

## Getting started

### Prerequisites

- Node.js version supported by the Angular version installed in this repository.
- npm.
- A MongoDB Atlas cluster or another MongoDB instance reachable by the application.

Check the required Node.js version against the installed Angular version before upgrading Node.js or Angular.

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd afterlight
```

Replace the repository URL with the actual GitHub repository URL. If your repository uses a different directory name, change the `cd` command accordingly.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```dotenv
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority"
```

Replace the placeholders with your MongoDB connection details. URL-encode special characters in the username or password when required by MongoDB connection-string rules.

Do not commit `.env` or publish database credentials. Ensure `.env` is included in `.gitignore`.

### 4. Run locally

```bash
npm start
```

Open the local URL printed by the Angular development server. In the current development setup this has been `http://localhost:4200`.

If the `start` script is different in your current `package.json`, use the script defined there. You can inspect available scripts with:

```bash
npm run
```

### 5. Build

```bash
npm run build
```

Use the production build command and SSR start command defined in the repository's `package.json` when running outside the development server.

## API

The Express API currently provides these memory endpoints:

| Method     | Endpoint              | Purpose                                                  |
| ---------- | --------------------- | -------------------------------------------------------- |
| `GET`    | `/api/health`       | Basic API health check                                   |
| `GET`    | `/api/memories`     | List saved memories (currently limited to the latest 50) |
| `GET`    | `/api/memories/:id` | Retrieve one memory                                      |
| `POST`   | `/api/memories`     | Create a memory                                          |
| `PATCH`  | `/api/memories/:id` | Update a memory                                          |
| `DELETE` | `/api/memories/:id` | Delete a memory                                          |

### Memory fields

A memory currently supports:

- `title` — memory title.
- `personName` — the person associated with the memory.
- `relationship` — optional relationship description.
- `story` — the memory's written story.
- `favoriteThings` — an array of strings.
- `memoryDate` — optional date associated with the memory.
- `createdAt` and `updatedAt` — timestamps supplied by Mongoose.

Example create request:

```http
POST /api/memories
Content-Type: application/json
```

```json
{
  "title": "Sunday afternoons with Grandma",
  "personName": "Grandma",
  "relationship": "Grandmother",
  "story": "We used to spend Sunday afternoons making tea and sharing stories.",
  "favoriteThings": ["Old songs", "Gardening", "Chai"],
  "memoryDate": "2024-05-12"
}
```

The API validates the request and stores the memory in MongoDB. Use the actual model and route validation in the repository as the source of truth if the schema changes.

## Deployment

Afterlight can be deployed to Vercel with the Angular SSR application and Express API hosted from the same project, provided the Vercel build and function routing are configured for the custom Node.js/SSR entry point.

### Vercel environment variable

Add the following environment variable in the Vercel project settings for the appropriate environments:

| Variable        | Description                                              |
| --------------- | -------------------------------------------------------- |
| `MONGODB_URI` | MongoDB connection string for the deployment environment |

If additional environment variables are introduced later (for example, authentication secrets or an AI provider key), configure them in Vercel rather than committing them to the repository.

### After deployment

Verify the deployed application instead of relying only on a successful build:

1. Open the deployed homepage.
2. Check `/api/health`.
3. Create a test memory.
4. Refresh the page and confirm the memory persists.
5. Edit and delete the test memory.
6. Review Vercel function logs and MongoDB connectivity if any request fails.

Use fictional test data until authentication and per-user authorization are implemented and verified.

## Security and privacy status

Memories may contain sensitive personal and family information. **The current MVP should not be treated as a secure private archive yet.** The memory API described in this README does not yet enforce authenticated ownership for each record.

Before inviting users to store real personal memories, implement and test:

- Authentication for private API routes.
- Server-side ownership checks on every read, update, and delete operation.
- Server-side assignment of the memory owner during creation.
- Request validation, rate limiting, safe error handling, and suitable security headers.
- Restricted database credentials and network access.
- Automated backups and a tested restore process.
- A clear privacy notice, data export, and account/data deletion process.

A user identifier supplied by the browser must never be trusted as proof of ownership. The server must derive the signed-in user from a verified session and scope database operations to that user.

## Development notes

- Keep API routes under `/api` and ensure they are registered before the Angular SSR fallback.
- Keep MongoDB credentials and other secrets out of source control.
- Test API behavior with Thunder Client or another HTTP client during development.
- Test the production SSR build and deployed API routes after changing the server entry point or Vercel configuration.
- Do not send private memory content to an AI provider unless the user is informed and the data-processing behavior is appropriate for the feature.

## Contributing

Contributions and suggestions are welcome. For changes involving personal data, authentication, storage, or sharing, include tests for access control and failure cases—not only the happy path.

## License

No license has been specified yet. Add a `LICENSE` file and update this section before accepting reuse or contributions under an open-source license.

---

**Afterlight — Remember. Reflect. Preserve**

# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
