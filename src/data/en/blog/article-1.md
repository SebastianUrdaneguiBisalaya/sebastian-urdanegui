---
author: Sebastian Marat Urdanegui Bisalaya
publishDate: "2025-09-24"
views: 150
comments: 150
---

# **Voice Agent for Forms: A Practical Guide with FastAPI and Groq**

**Artificial Intelligence (AI)** applications have become increasingly popular across various sectors, especially in customer service, where we've moved from chatbots with rigid procedures to advanced **Natural Language Processing (NLP)** tools powered by **Large Language Models (LLMs)**.

Recently, we had the idea of creating a **voice agent for forms from scratch**. The goal was to allow users to complete forms using their voice to speed up the process and reduce data entry time. However, before jumping into code, it's crucial to understand the underlying process to build a robust tool. We thought the idea was excellent, so we decided to document the development process for others to replicate and improve upon.

In this article, we'll focus on the back-end development, as we consider it the fundamental part that allows the client (web or mobile) to interact with our agent.

Below, we'll detail the steps to clone the <span href="https://github.com/SebastianUrdaneguiBisalaya/building-a-voice-agents-for-forms" target="_blank">repository</span> onto your computer so you can follow along. If you want, you can make any changes you deem necessary to adapt it to your needs.

For this project, we'll use <span href="https://fastapi.tiangolo.com/" target="_blank">FastAPI</span> as the framework to build the back-end and <span href="https://groq.com/" target="_blank">Groq</span> to connect to the AI models and get the desired results.

> [!NOTE]
> You can develop this application using your preferred framework, such as <span href="https://expressjs.com/" target="_blank">Express.js</span>, <span href="https://nestjs.com/" target="_blank">NestJS</span>, etc. We choose **FastAPI** for its high performance, ease of use, and because it leverages the <span href="https://www.python.org/" target="_blank">Python</span> programming language, making development more versatile and robust.

## **Installation**

### **Server**

Go to your terminal and run the following commands:

- Clone the repository:

```bash
git clone https://github.com/SebastianUrdaneguiBisalaya/building-a-voice-agents-for-forms
```

- Move into the server directory:

```bash
cd building-a-voice-agents-for-forms
```

- Create a virtual environment:

```bash
python -m venv venv
```

- Activate the virtual environment:

```bash
source venv/bin/activate # (masOS)
venv\Scripts\activate # (Windows)
```

- Install dependencies:

```bash
pip install -r requirements.txt
```

- Create a ```.env``` file in the project's root with the following environment variables:

```bash
ENVIRONMENT=development # (development or production)
API_GROQ=****************
```

- Run the server:

```bash
fastapi dev src/app/main.py
```

### **Client**

- Move into the client directory:

```bash
cd building-a-voice-agents-for-forms/client
```

- Install dependencies:

```bash
pnpm install
```

- Run the client development server:

```bash
pnpm dev
```

## **Business logic**

### **WebSocket**

**WebSocket** is a communication protocol that allows for a bidirectional, long-lasting connection between a client and a server.

While other protocols like **HTTP**, **HTTP/2 Streaming**, **Server-Sent Events (SSE)**, and **WebRTC** exist, we'll focus on **WebSocket** to establish a persistent and fluid connection between the client and the server.

The following diagram shows the basic communication flow using **WebSocket**:

```mermaid
sequenceDiagram
    autonumber
    participant C as 💻 Client
    participant S as ⛃ Server

    C->>S: Handshake (HTTP Upgrade)
    S-->>C: Open Connection
    C<<->>S: Bidirectional Messages
    Note over C,S: Open and Persistent Connection
    C<<->>S: One side closes the connection
    Note over C,S: Connection Closed
```

Basically, the client makes an HTTP request to establish a durable, bidirectional connection with the server; this process is known as **handshake**. Once the connection is established, the client and server can send and receive messages fluidly.

Considering the WebSocket flow, we can build the process in a way that gives the user a fluid and natural interaction with the voice agent.

```mermaid
sequenceDiagram
    autonumber
    participant U as 🧑 User
    participant C as 💻 Client (App/Browser)
    participant STT as 🤖 Speech-to-Text (AI)
    participant LLM as 🧠 LLM (AI)
    participant DB as 🗄️ Database

    Note over C,U: The client plays the question<br>in audio (local or external TTS)
    C->>U: "What is your name?"
    U->>C: Voice response

    C->>STT: Send audio
    STT-->>C: Transcribed text

    C->>LLM: Validate if the transcription answers the question
    LLM-->>C: "Valid response" or "No response"

    alt Valid response
        C->>DB: Save {question, response}
        C->>U: Next question (audio)
    else No response
        C->>U: Repeat question (audio)
    end

    Note over C,DB: At the end → save the form
```

### **FastAPI Process**

The ```config.py``` file handles environment variable management. It uses ```python-dotenv``` to load variables from the ```.env``` file and ```Pydantic``` to securely validate and type these variables, ensuring the application won't start if any critical configuration is missing.

```python title="src/config/config.py"
import os
from pydantic import ValidationError, Field
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.join(os.path.dirname(__file__), ".."))

load_dotenv(BASE_DIR)


class Settings(BaseSettings):
    environment: str = Field(..., alias="ENVIRONMENT")
    api_groq: str = Field(..., alias="API_GROQ")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


def get_settings():
    try:
        settings = Settings()
        return settings
    except ValidationError as e:
        print(f"The environment variables are not set. {e}")
        raise e


settings = get_settings()
```

The ```classes.py``` file defines the key classes for session and connectivity management. The ```ConnectionManager``` class handles active WebSocket connections, with methods to connect, disconnect and send messages to individual clients or all of them (broadcast). This is useful for managing connection persistence (e.g., with 'ping' messages).

The ```FormSession``` class is the core of the form's logic. It's responsible for tracking a user's session, controlling the current question's index, storing validated answers, and determining when the form is complete. While the data is currently stored in memory, this design facilitates future integration with a database.

```python title="src/classes/classes.py"
from typing import Any, Dict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)


class FormSession:
    def __init__(self, questions: list[dict]):
        self.current_index = 0
        self.questions = questions
        self.answers: Dict[str, Any] = {}
        self.completed = False

    def current_question(self) -> dict:
        return self.questions[self.current_index]

    def record_answer(self, key: str, value: Any):
        self.answers[key] = value
        self.current_index += 1
        if self.current_index >= len(self.questions):
            self.completed = True


manager = ConnectionManager()
```

If you're familiar with data typing in **TypeScript**, you'll find the use of **Pydantic** in Python to be similar. The ```BaseModel``` class allows us to define structured and validated data schemas, which is fundamental for handling function inputs and outputs in our API.

> [!TIP]
> We suggest always typinh your code. It's a good programming practice that prevents errors and improves readability.

```python title="src/models/models.py"
from pydantic import BaseModel
from typing import Optional, TypeVar

T = TypeVar("T")

class TranscriptionGroq(BaseModel):
    audio_base64: str
    language: str


class MessagesGroq(BaseModel):
    role: str
    content: str


class GreetingGroq(BaseModel):
    language: str
    current_question: str


class ValidateDataGroq(BaseModel):
    language: str
    current_question: str
    next_question: Optional[str] = None
    transcription: str
    expected_type: str


class APIResponseValidationGroq(BaseModel):
    is_response_valid: bool
    normalized_value: Optional[T] = None
    reply_message: str
```

The ```groq.py``` file encapsulates the logic for interacting with the Groq API. Each function here communicates with a task-specific AI model: ```greeting_groq``` to generate an initial greeting, ```transcription_groq``` to transcribe audio, and ```validate_data_groq``` to validate and normalize the user response. Importantly, each function uses a carefully crafted prompt to guide the model toward the desired response, including the expected output format.

```python title="src/lib/groq.py"
from src.config.config import settings
from src.models.models import GreetingGroq, TranscriptionGroq, ValidateDataGroq, MessagesGroq, APIResponseValidationGroq
from groq import Groq, AsyncGroq
import json

_GROQ_CLIENT = Groq(
    api_key=settings.api_groq,
)

_ASYNC_GROQ_CLIENT = AsyncGroq(
    api_key=settings.api_groq,
)


async def greeting_groq(data: GreetingGroq):
    response = await _ASYNC_GROQ_CLIENT.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            MessagesGroq(
                role="system",
                content=(
                    f"You are a helpful assistant taking form responses.\n"
                    f"You just greeted the user and must ask them the first question.\n"
                    f"Your name is Clara.\n"
                    f"The current question is: {data.current_question}.\n"
                    f"The language that you must use is: {data.language}.\n"
                    f"If the questions are not in the same language of {data.language}, you must translate them.\n"
                    f"Example:\n"
                    f"If the current question is 'What is your name?' and the language is Spanish, you must return the question in Spanish.\n"
                    f"'What is your name?' Hola, yo soy Clara, encargada de conducir el siguiente formulario. Empecemos, la primera pregunta es: ¿Cuál es tu nombre?'\n"
                    f"Your greeting should be polite and friendly.\n"
                    f"Important: Output must be plain text only, without Markdown, bold (**), italics, quotes, or any extra symbols.\n"
                ),
            ),
        ],
        temperature=0.3,
        stream=False,
    )
    return response.choices[0].message.content


def transcription_groq(data: TranscriptionGroq):
    transcription = _GROQ_CLIENT.audio.transcriptions.create(
        url=data.audio_base64,
        model="whisper-large-v3-turbo",
        prompt=(
            f"Context:\n"
            f"You are a helpful assistant. Your name is Clara. You must determine language of the audio.\n"
            f"Then, you must translate the audio to {data.language} and return the transcription.\n"
            f"Example:\n"
            f"If the audio is in English, you must return the transcription in {data.language}.\n"
        ),
        response_format="verbose_json",
        language=data.language,
        temperature=0.3,
    )
    return transcription.text.strip()


async def validate_data_groq(data: ValidateDataGroq):
    response = await _ASYNC_GROQ_CLIENT.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            MessagesGroq(
                role="system",
                content=(
                    f"You are a helpful assistant taking form responses.\n"
                    f"The current question is: {data.current_question}.\n"
                    f"The expected type is: {data.expected_type}.\n"
                    f"The next question is: {data.next_question}.\n"
                    f"If the questions are not in the same language of {data.language}, you must translate them.\n"
                    f"The language that you must use is: {data.language}.\n"
                    f"Instructions:\n"
                    f"1. Always validate if the user response matches the expected type.\n"
                    f"2. If valid:\n"
                    f"   - Normalize the value (e.g., 'twenty-four' -> 24, 'juan at gmail dot com' -> 'juan@gmail.com').\n"
                    f"   - Confirm politely to the user.\n"
                    f"   - If there is a next question, include it naturally in the reply.\n"
                    f"   - If there is no next question, thank the user and say the form is complete.\n"
                    f"3. If invalid:\n"
                    f"   - Politely explain why the answer is invalid.\n"
                    f"   - Repeat the current question again, naturally.\n"
                    f"4. Always return JSON only with the following structure:\n"
                    f"{{\n"
                    f"  'is_response_valid': bool,\n"
                    f"  'normalized_value': Any or null,\n"
                    f"  'reply_message': str  # human-like, polite response with either the next or current question\n"
                    f"}}\n"
                    f"Important: Output of 'reply_message' must be plain text only, without Markdown, bold (**), italics, quotes, or any extra symbols.\n"
                )
            ),
            MessagesGroq(
                role="user",
                content=data.transcription,
            ),
        ],
        temperature=0.3,
        stream=False,
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "api_response_validation_groq",
                "schema": APIResponseValidationGroq.model_json_schema()
            }
        }
    )
    api_response_validation = APIResponseValidationGroq.model_validate(
        json.loads(response.choices[0].message.content))
    return api_response_validation
```

This file (```voice_agents.py```) acts as the back-end's **"brain"**, controlling the flow of interaction through the WebSocket. The ```/api/v1/ws/voice-agents``` route handles the bidirectional communication between the client and the server. Upon connection, the server starts a form session for the provided ```user_id``` and ```language```. It sends an initial greeting with the first form question. In each interaction, the server:

1. Receives audio from the user.

2. Uses the ```groq.py``` functions to transcribe, validate and normalize the response.

3. If the response is valid, it advances to the next question and sends it to the client.

4. If the response is invalid, it sends an error message and repeats the current question.

5. When the form is complete, it sends the collected answers and closes the flow.

> [!WARNING]
> This approach delegates data validation to the LLM but keeps the form's flow control on the back-end, ensuring all questions are followed and the logic is handled predictably.

```python title="src/app/routers/voice_agents.py"
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
from src.config.config import settings
from src.classes.classes import manager, FormSession
from src.lib.groq import greeting_groq, transcription_groq, validate_data_groq
from src.models.models import GreetingGroq, TranscriptionGroq, ValidateDataGroq
import logging

level = logging.INFO if settings.environment == "development" else logging.WARNING

logging.basicConfig(level=level)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1",
    tags=["Voice Agents"],
    responses={404: {"description": "Not found"}},
)

sessions: Dict[str, FormSession] = {}


@router.websocket("/ws/voice-agents")
async def voice_agents(websocket: WebSocket):
    try:
        await manager.connect(websocket)
        user_id = websocket.query_params.get("user_id")
        language = websocket.query_params.get("language")
        print(user_id, language)
        sessions[user_id] = FormSession([
                                        {"key": "age", "question": "What is your age?",
                                            "type": "int"},
                                        {"key": "email", "question": "What is your email?",
                                            "type": "str"},
                                        {"key": "phone", "question": "What is your phone number?",
                                            "type": "str"},
                                        ])
        session = sessions[user_id]
        greeting = await greeting_groq(GreetingGroq(
            language=language,
            current_question=session.current_question()['question'],
        ))
        await websocket.send_text(greeting)
        while True:
            data = await websocket.receive_json()
            audio_base_64 = data.get("audio")
            if not audio_base_64:
                await websocket.send_text("No audio received")
                continue
            transcription = transcription_groq(
                TranscriptionGroq(
                    audio_base64=audio_base_64,
                    language=language,
                )
            )
            current_question = session.current_question()
            next_question = None if session.current_index + \
                1 >= len(session.questions) else session.questions[session.current_index + 1]
            result = await validate_data_groq(ValidateDataGroq(
                language=language,
                current_question=current_question["question"],
                next_question=next_question["question"] if next_question else None,
                transcription=transcription,
                expected_type=current_question["type"],
            ))
            if not result.is_response_valid:
                await websocket.send_json({
                    "message": f"{result.reply_message}",
                })
                continue
            session.record_answer(
                current_question["key"], result.normalized_value)
            if session.completed:
                await websocket.send_json({
                    "message": f"{result.reply_message}",
                    "answers": session.answers,
                })
                break
            else:
                next_question = session.current_question()
                await websocket.send_json({
                    "message": f"{result.reply_message}",
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"Client disconnected: {websocket.client}")
    except Exception as e:
        manager.disconnect(websocket)
        logger.error(f"Websocket error: {e}", exc_info=True)
        await websocket.close(code=1011, reason="Internal server error")
```

The ```main.py``` file is our API's entry point. It defines the routes for client-server communication and configures the necessary middlewares for the application to function.

```python title="src/app/main.py"
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config.config import settings
from src.app.routes import voice_agents

is_production = settings.environment == "production"

app = FastAPI(
    title="Building a voice agents for forms",
    description="Using FastAPI and Groq API",
    version="1.0.0",
    terms_of_service=None,
    docs_url="/docs",
    redoc_url="/redoc",
    contact={
        "name": "Sebastian Marat Urdanegui Bisalaya",
        "url": "https://sebastianurdanegui.vercel.app/",
        "email": "sebasurdanegui@gmail.com"
    }
)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

app.include_router(voice_agents.router)
```

Once you hacve cloned the repository, the ```client``` folder contains the necessary code to run a basic UI that will allow you to test the voice agent. All that's left is to run both the back-end and client development servers on your computer.

> [!IMPORTANT]
> If you found this article valuable or would like to see more content on other topics, you can support us by leaving a comment in the section below 👇🏻. You can also share this article with your friends and colleagues 😊.