# WAWY: A Chatbot for Academic Stress Support

WAWY is a conversational chatbot designed to provide structured support for university students experiencing academic stress. The system uses a predefined conversational flow and natural language understanding to guide users through supportive interactions related to common academic stress situations.

This repository contains the source code, conversational models, configuration files, and technical documentation associated with the WAWY chatbot.

## Purpose

The purpose of WAWY is to explore the use of conversational agents as a technological tool for supporting students in managing situations related to academic stress.

The chatbot is intended as a research and educational support tool and is not designed to replace professional psychological or medical care.

## System Architecture

WAWY follows a modular client-server architecture.

```text
User
  │
  ▼
Frontend
  │
  ▼
Node.js API
  │
  ▼
Rasa Conversational Engine
  │
  ├── NLU
  ├── Stories
  ├── Rules
  ├── Domain
  └── Custom Actions
  │
  ▼
MySQL Database
```

The main components are:

- **Frontend:** graphical interface through which users interact with the chatbot.
- **Node.js API:** communication layer between the frontend, conversational engine, and other system services.
- **Rasa:** conversational AI framework responsible for natural language understanding and dialogue management.
- **Custom Actions:** server-side actions used to execute specific chatbot functions.
- **MySQL:** relational database used by the platform for managing application data.

## Technologies

The main technologies used in WAWY include:

- Rasa
- Python
- Node.js
- JavaScript
- MySQL
- HTML/CSS
- REST API
- Docker

## Repository Structure

```text
wawy-academic-stress-chatbot/
│
├── README.md
├── LICENSE
├── CITATION.cff
├── .gitignore
│
├── frontend/
│
├── backend/
│   ├── api/
│   └── rasa/
│       ├── actions/
│       ├── data/
│       │   ├── nlu.yml
│       │   ├── rules.yml
│       │   └── stories.yml
│       ├── domain.yml
│       ├── endpoints.yml
│       └── config.yml
│
├── database/
│
├── conversation-design/
│
└── documentation/
```

## Conversational Model

The conversational component of WAWY is implemented using Rasa.

The main configuration files include:

- `nlu.yml`: intents, examples, and entities used by the Natural Language Understanding module.
- `stories.yml`: examples of conversational paths used to train dialogue management.
- `rules.yml`: deterministic conversational rules.
- `domain.yml`: intents, entities, slots, responses, forms, and actions available to the assistant.
- `actions.py`: implementation of custom actions.
- `endpoints.yml`: configuration of external services and the Rasa Action Server.

The conversational design follows a structured intervention flow intended to support interaction around situations of academic stress.

## Installation

### Requirements

Before running WAWY, install:

- Python 3.x
- Node.js
- npm
- MySQL
- Rasa
- Docker, if using the containerized deployment

### Clone the Repository

```bash
git clone https://github.com/SandraCano-PUCV/WAWY_chatbot.git
cd wawy-academic-stress-chatbot
```

## Running the Rasa Server

Navigate to the Rasa project directory:

```bash
cd backend/rasa
```

Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

Train the conversational model:

```bash
rasa train
```

Start the Rasa server:

```bash
rasa run --enable-api --cors "*"
```

In another terminal, start the action server:

```bash
rasa run actions
```

## Running the Node.js API

Navigate to the API directory:

```bash
cd backend/api
```

Install the dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

## Running the Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Run the application:

```bash
npm start
```

The exact command may vary depending on the frontend framework and project configuration.

## Database Configuration

WAWY uses MySQL for persistent storage.

Database credentials and other sensitive configuration parameters should be stored using environment variables.

For example:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wawy
DB_USER=your_user
DB_PASSWORD=your_password
```

Do not commit `.env` files, passwords, API keys, authentication tokens, or production credentials to the repository.

An `.env.example` file may be provided to document the required configuration variables without exposing credentials.

## Privacy and Data Protection

This repository must not contain personally identifiable information or data collected from research participants.

Any research dataset associated with the WAWY study should be anonymized or de-identified before being made publicly available.

Sensitive information such as:

- participant names,
- email addresses,
- authentication credentials,
- raw conversational logs,
- IP addresses,
- database passwords,
- access tokens,

should not be included in the public repository.

## Ethical Considerations

WAWY was developed as a research-oriented chatbot for academic stress support.

The system should not be interpreted as:

- a diagnostic system,
- a clinical decision-support system,
- a substitute for psychotherapy,
- a substitute for psychological counseling,
- or an emergency mental-health service.

Users requiring professional or urgent psychological support should be directed to appropriate qualified services.

## Research Use

This repository accompanies research concerning the design, implementation, and evaluation of WAWY.

When using the software or adapting its conversational model for research purposes, please cite the corresponding software release and associated publication.

## Citation

If you use WAWY in your research, please cite this repository.

Citation metadata are provided in:

```text
CITATION.cff
```

A permanent DOI for released versions of the software is provided through Zenodo.

Once the DOI is available, it can be included here:

```text
https://doi.org/10.5281/zenodo.22181889
```
[![DOI](https://zenodo.org/badge/1351780069.svg)](https://doi.org/10.5281/zenodo.22181889)


### Suggested Citation

```text
Cano, S., et al. (2026).
WAWY: A Chatbot for Academic Stress Support.
Version 1.0.0.
Zenodo.
https://doi.org/10.5281/zenodo.22181889
```

## Versioning

The project follows semantic versioning.

```text
MAJOR.MINOR.PATCH
```

For example:

```text
v1.0.0
```

GitHub releases are archived through Zenodo to provide persistent research artifacts and version-specific DOIs.

## License

This project is distributed under the terms described in the `LICENSE` file.

Please review the license before using, modifying, or redistributing the software.

## Authors

WAWY was developed by the research team associated with the project.

Author information and identifiers such as ORCID are available in the `CITATION.cff` file.

## Acknowledgments

The authors acknowledge the institutions, researchers, students, and collaborators who contributed to the design and evaluation of the WAWY platform.

## Disclaimer

WAWY is provided for research and educational purposes.

The software is provided without warranties regarding clinical effectiveness, suitability for diagnosis, or therapeutic outcomes.

# WAWY — Installation and Startup Guide

This guide explains how to install and run the **WAWY** ecosystem, composed of:

- **Frontend:** React + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Conversational engine:** Rasa 3.6.21
- **Action Server:** Rasa SDK
- **Database:** MySQL
- **Response persistence:** `actions/conection.py`

The overall architecture is:

```text
React
http://localhost:3000
        |
        | HTTP + session cookie
        v
Node.js / Express
http://localhost:3001
        |
        | REST
        v
Rasa
http://localhost:5005
        |
        | Action Endpoint
        v
Rasa Action Server
http://localhost:5055
        |
        v
MySQL
localhost:3306
```

---

# 1. Prerequisites

Before starting, verify that the following are installed.

## Node.js and npm

```bash
node -v
npm -v
```

A recent Node.js LTS version is recommended.

---

## Python

This project uses Python 3.8 with **Rasa 3.6.21**.

```bash
python --version
```

Expected result:

```text
Python 3.8.x
```

---

## MySQL

Verify that MySQL is listening on port `3306`:

```bash
lsof -i :3306
```

You can also test the connection:

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p
```

---

# 2. Recommended Project Structure

A possible structure is:

```text
wawy/
|
├── client/
|   └── React + TypeScript
|
├── server/
|   └── Node.js + Express + TypeScript
|
└── rasa/
    ├── actions/
    |   ├── __init__.py
    |   ├── actions.py
    |   └── conection.py
    |
    ├── data/
    |   ├── nlu.yml
    |   ├── stories.yml
    |   └── rules.yml
    |
    ├── models/
    ├── config.yml
    ├── credentials.yml
    ├── domain.yml
    └── endpoints.yml
```

---

# 3. MySQL Database

Create or use the database:

```sql
CREATE DATABASE chatbot
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Select it:

```sql
USE chatbot;
```

The application uses at least these tables:

```text
usuarios
respuestas
```

The `usuarios` table should contain fields equivalent to:

```sql
CREATE TABLE usuarios (
    idusuarios INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    activo TINYINT NOT NULL DEFAULT 1,
    User_ID VARCHAR(255) NOT NULL UNIQUE
);
```

Passwords must be stored with **bcrypt**, not as plaintext.

A basic table for responses captured by Rasa can be:

```sql
CREATE TABLE respuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    fecha DATETIME NOT NULL,
    CONSTRAINT fk_respuestas_usuario
        FOREIGN KEY (idUsuario)
        REFERENCES usuarios(idusuarios)
);
```

---

# 4. Emotion Diary

If the Emotion Diary module is used, create:

```sql
CREATE TABLE diario_emociones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    emocion VARCHAR(50) NOT NULL,
    intensidad TINYINT NOT NULL,
    contexto VARCHAR(100) NULL,
    descripcion TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_diario_usuario
        FOREIGN KEY (idUsuario)
        REFERENCES usuarios(idusuarios),

    CONSTRAINT chk_intensidad
        CHECK (intensidad BETWEEN 1 AND 5)
);
```

---

# 5. Install the Node.js Backend

Enter the backend directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

If creating the project from scratch:

```bash
npm install express cors mysql2 bcryptjs express-session
```

Development dependencies:

```bash
npm install -D \
  typescript \
  tsx \
  @types/node \
  @types/express \
  @types/cors \
  @types/express-session
```

---

# 6. Basic Backend Configuration

The WAWY backend uses:

```text
Backend port: 3001
Frontend allowed by CORS: http://localhost:3000
MySQL: 127.0.0.1:3306
Database: chatbot
Rasa: http://127.0.0.1:5005
```

Example:

```ts
const PORT = 3001;
const HOST = "127.0.0.1";

const FRONTEND_URL =
  "http://localhost:3000";

const RASA_URL =
  "http://127.0.0.1:5005";
```

CORS must be configured as:

```ts
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
```

Do not use:

```ts
origin: "*"
```

together with:

```ts
credentials: true
```

---

# 7. Express Sessions

The login creates a session:

```ts
req.session.userId =
  usuario.User_ID;

req.session.email =
  usuario.email;
```

React must use:

```ts
credentials: "include"
```

for requests that depend on the session.

Example:

```ts
fetch(
  "http://localhost:3001/sesion",
  {
    credentials: "include",
  }
);
```

---

# 8. Chat Endpoint

The backend does not generate the dialogue directly.

Its role is to:

1. verify the user session;
2. obtain the `User_ID`;
3. send it as `sender` to Rasa;
4. return the complete Rasa response to the frontend.

The body sent to Rasa has the following format:

```json
{
  "sender": "USER_ID",
  "message": "hello"
}
```

Rasa receives the identifier through:

```python
tracker.sender_id
```

---

# 9. Important: Route Order in Express

The `404` middleware must be declared **after all routes**.

Correct:

```ts
app.post("/autenticacion", ...);

app.get("/sesion", ...);

app.post("/chat", ...);

app.get("/emociones", ...);

app.post("/emociones", ...);

/* ALWAYS AT THE END */
app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    message: "Route not found",
  });
});
```

If the `404` middleware appears before `/chat`, Express will never reach the `/chat` endpoint.

---

# 10. Start the Backend

If `package.json` contains:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

During development:

```bash
npm run dev
```

The server should display:

```text
MySQL connection established
WAWY server running at http://localhost:3001
```

---

# 11. Install the React Frontend

Enter the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Used dependencies:

```bash
npm install react-router-dom react-bootstrap bootstrap
```

---

# 12. Frontend Configuration

Example:

```text
src/config/config.js
```

Content:

```js
const config = {
  API_URL: "http://localhost:3001",
};

export default config;
```

The frontend must never contain:

```text
MySQL password
SESSION_SECRET
private credentials
```

---

# 13. Start React

From `client/`:

```bash
npm start
```

The application should be available at:

```text
http://localhost:3000
```

---

# 14. React Routes

The main routes can be:

```text
/
├── /login
├── /registro
├── /chat
├── /diario-de-emociones
└── /not-to-do-list
```

`/chat` and `/diario-de-emociones` should be protected using `ProtectedRoute`.

Example:

```tsx
<Route
  path="/chat"
  element={
    <ProtectedRoute>
      <Chat />
    </ProtectedRoute>
  }
/>
```

---

# 15. Activate the Rasa Python Environment

Enter the Rasa project:

```bash
cd rasa
```

Activate the existing environment:

```bash
source ../vent/bin/activate
```

or, if the environment is inside the project:

```bash
source vent/bin/activate
```

Verify:

```bash
python --version
rasa --version
```

Expected output:

```text
Python 3.8.x
Rasa 3.6.21
```

---

# 16. Python Dependencies

With the environment activated:

```bash
pip install rasa==3.6.21
pip install rasa-sdk
pip install mysql-connector-python
```

Verify the MySQL connector:

```bash
python -c "import mysql.connector; print('mysql connector OK')"
```

Expected result:

```text
mysql connector OK
```

---

# 17. Configure `credentials.yml`

React communicates with Express, and Express communicates with Rasa through REST.

`credentials.yml`:

```yaml
rest:
```

Socket.IO is not required if React communicates with Express using `fetch`.

---

# 18. Configure `endpoints.yml`

To connect Rasa to the Action Server:

```yaml
action_endpoint:
  url: "http://127.0.0.1:5055/webhook"
```

---

# 19. Validate the Rasa Project

Before training:

```bash
rasa data validate
```

Fix any relevant errors before continuing.

---

# 20. Train Rasa

```bash
rasa train
```

A model will be created in:

```text
models/
```

For example:

```text
models/20260908-xxxxxx.tar.gz
```

Do not use the old Rasa 2.2.9 model with Rasa 3.6.21.

Use the migrated source files and train a new model.

---

# 21. Validate `actions.py`

Before starting the Action Server:

```bash
python -m py_compile actions/actions.py
```

Also validate:

```bash
python -m py_compile actions/conection.py
```

If there is no output, the Python syntax is valid.

---

# 22. Avoid Duplicate Actions

Verify that `ActionSaludo` exists only once:

```bash
grep -n "class ActionSaludo" actions/actions.py
```

It should return only one line.

Verify that the old code no longer exists:

```bash
grep -n "split('|')" actions/actions.py
```

The output should be empty.

The new implementation uses:

```python
tracker.sender_id
```

instead of:

```python
sender_id.split("|")
```

---

# 23. Start the Rasa Action Server

Open a terminal.

Activate the environment:

```bash
source vent/bin/activate
```

Then run:

```bash
rasa run actions --port 5055
```

Expected output:

```text
Starting action endpoint server...
Action endpoint is up and running
```

Keep this terminal open.

---

# 24. Start Rasa

Open a second terminal.

Activate the environment:

```bash
source vent/bin/activate
```

Run:

```bash
rasa run \
  --enable-api \
  --credentials credentials.yml \
  --endpoints endpoints.yml \
  --port 5005
```

For debugging:

```bash
rasa run \
  --enable-api \
  --credentials credentials.yml \
  --endpoints endpoints.yml \
  --port 5005 \
  --debug
```

---

# 25. Test Rasa Directly

Before involving React or Express:

```bash
curl -X POST \
  http://127.0.0.1:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "REAL_USER_ID",
    "message": "/saludo"
  }'
```

`REAL_USER_ID` must exist in:

```text
usuarios.User_ID
```

if you also want to test persistence through `conection.py`.

---

# 26. Test the Backend with Insomnia

First authenticate:

```text
POST http://localhost:3001/autenticacion
```

Body:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Insomnia should preserve the cookie:

```text
wawy.sid
```

Then call:

```text
POST http://localhost:3001/chat
```

Body:

```json
{
  "message": "/saludo"
}
```

The response should be similar to:

```json
{
  "ok": true,
  "messages": [
    {
      "recipient_id": "USER_ID",
      "text": "Hello, I am WAWY..."
    },
    {
      "recipient_id": "USER_ID",
      "text": "What is your name?"
    }
  ]
}
```

---

# 27. Complete Flow from React

The expected flow is:

```text
User
  |
  v
/login
  |
  | email + password
  v
POST /autenticacion
  |
  | bcrypt
  v
Express Session
  |
  | wawy.sid cookie
  v
/chat
  |
  | POST /chat
  v
Express
  |
  | sender = req.session.userId
  v
Rasa
  |
  | tracker.sender_id
  v
Stories / Forms / Actions
  |
  v
MySQL
```

---

# 28. Rasa Buttons

Rasa can return buttons:

```json
{
  "text": "Would you like to continue?",
  "buttons": [
    {
      "title": "Yes",
      "payload": "/afirmativo"
    },
    {
      "title": "No",
      "payload": "/negativo"
    }
  ]
}
```

React should display the `title`, but send the `payload`.

Example:

```text
Visible to the user:
Yes

Sent to Rasa:
/afirmativo
```

---

# 29. Multimedia Resources

WAWY uses:

```text
text
buttons
image
custom
video
ButtonsCarusel
```

For this reason, Express should return the original Rasa message array:

```ts
return res.json({
  ok: true,
  messages,
});
```

instead of converting all messages into a single string.

---

# 30. Assets

Resources used by Rasa, for example:

```text
assets/iconos/ahogo.png
assets/img/pensamientos.png
```

must also exist in a location accessible to React.

A simple option is:

```text
client/public/assets/
├── iconos/
└── img/
```

Then React can load:

```text
/assets/iconos/ahogo.png
```

---

# 31. Recommended Startup Order

Open separate terminals for each service.

## Terminal 1 — MySQL

Verify:

```bash
lsof -i :3306
```

---

## Terminal 2 — Action Server

```bash
cd rasa
source vent/bin/activate
rasa run actions --port 5055
```

---

## Terminal 3 — Rasa

```bash
cd rasa
source vent/bin/activate

rasa run \
  --enable-api \
  --credentials credentials.yml \
  --endpoints endpoints.yml \
  --port 5005
```

---

## Terminal 4 — Node Backend

```bash
cd server
npm run dev
```

It should run at:

```text
http://localhost:3001
```

---

## Terminal 5 — React

```bash
cd client
npm start
```

It should run at:

```text
http://localhost:3000
```

---

# 32. Ports Used

| Service | Port |
|---|---:|
| React | 3000 |
| Express / Node.js | 3001 |
| Rasa | 5005 |
| Rasa Action Server | 5055 |
| MySQL | 3306 |

---

# 33. Quick Troubleshooting

## CORS

Error:

```text
blocked by CORS policy
```

Verify the backend:

```ts
cors({
  origin: "http://localhost:3000",
  credentials: true,
})
```

---

## React Receives 401

```text
401 Unauthorized
```

Verify:

```ts
credentials: "include"
```

and check:

```text
GET /sesion
```

---

## `/chat` Returns 404

Verify that no `404` middleware appears before:

```ts
app.post("/chat", ...)
```

---

## Rasa Cannot Find Actions

Verify:

```yaml
action_endpoint:
  url: "http://127.0.0.1:5055/webhook"
```

and run:

```bash
rasa run actions --port 5055
```

---

## Error in `actions.py`

Validate:

```bash
python -m py_compile actions/actions.py
```

---

## Error `sender_id.split('|')`

That code belongs to the old implementation.

Search for it:

```bash
grep -n "split('|')" actions/actions.py
```

The output should be empty.

The new implementation uses:

```python
tracker.sender_id
```

---

## MySQL `ECONNREFUSED`

Verify:

```bash
lsof -i :3306
```

Backend:

```ts
host: "127.0.0.1",
port: 3306
```

Python actions:

```python
host = "127.0.0.1"
port = 3306
```

---

# 34. Summary

After everything is installed, start WAWY as follows.

```bash
# Terminal 1
rasa run actions --port 5055
```

```bash
# Terminal 2
rasa run \
  --enable-api \
  --credentials credentials.yml \
  --endpoints endpoints.yml \
  --port 5005
```

```bash
# Terminal 3
npm run dev
```

in the backend directory.

```bash
# Terminal 4
npm start
```

in the frontend directory.

Then open:

```text
http://localhost:3000
```

The user flow is:

```text
Register
    ↓
Log in
    ↓
Enter /chat
    ↓
React calls Express
    ↓
Express calls Rasa
    ↓
Rasa uses stories/forms/actions
    ↓
Responses are stored in MySQL
```

---

# 35. Production Recommendations

Before deployment:

- use HTTPS;
- do not store `SESSION_SECRET` directly in source code;
- do not store MySQL passwords in the repository;
- use environment variables;
- keep bcrypt for password hashing;
- use a persistent Session Store instead of the default `MemoryStore`;
- restrict CORS to the real frontend domain;
- do not expose Rasa or MySQL directly to the Internet;
- protect chat and emotion-diary routes in both React and Express;
- review privacy, consent, retention, and access-control policies for emotional and user-generated data.