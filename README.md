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
git clone https://github.com/USERNAME/wawy-academic-stress-chatbot.git
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
https://doi.org/10.5281/zenodo.XXXXXXX
```

### Suggested Citation

```text
Cano, S., et al. (2026).
WAWY: A Chatbot for Academic Stress Support.
Version 1.0.0.
Zenodo.
https://doi.org/10.5281/zenodo.XXXXXXX
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