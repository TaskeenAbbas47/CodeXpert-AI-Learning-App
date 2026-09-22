# # # # main.py
# # # import os
# # # import socket
# # # import re
# # # import random
# # # import json # --- CHANGE: Import json for the manifest file
# # # from dotenv import load_dotenv
# # # from fastapi import FastAPI, Request
# # # from pydantic import BaseModel
# # # from datetime import datetime
# # # from langchain_community.document_loaders import PyPDFDirectoryLoader
# # # from langchain_text_splitters import RecursiveCharacterTextSplitter
# # # from langchain_openai import ChatOpenAI, OpenAIEmbeddings
# # # from langchain_chroma import Chroma
# # # from fastapi.middleware.cors import CORSMiddleware
# # # import uvicorn

# # # from langchain.chains import create_history_aware_retriever, create_retrieval_chain
# # # from langchain.chains.combine_documents import create_stuff_documents_chain
# # # from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# # # from langchain_core.chat_history import BaseChatMessageHistory
# # # from langchain_community.chat_message_histories import ChatMessageHistory

# # # # ========== Load environment ==========
# # # load_dotenv()
# # # OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# # # if not OPENAI_API_KEY:
# # #     raise ValueError("ERROR: OPENAI_API_KEY not found! Add it to .env file as OPENAI_API_KEY=sk-...")

# # # # ========== FastAPI Setup ==========
# # # app = FastAPI()
# # # app.add_middleware(
# # #     CORSMiddleware,
# # #     allow_origins=["*"],
# # #     allow_credentials=True,
# # #     allow_methods=["*"],
# # #     allow_headers=["*"],
# # # )

# # # # ========== Paths and Constants ==========
# # # BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# # # PERSIST_DIR = os.path.join(BASE_DIR, "chroma_db")
# # # PDF_BASE = os.path.join(BASE_DIR, "pdfs")
# # # TOPICS = ["python", "javascript", "html", "css"]
# # # # --- CHANGE: Added a manifest file to track indexed PDFs ---
# # # MANIFEST_FILE = os.path.join(PERSIST_DIR, "indexed_files.json")
# # # os.makedirs(PERSIST_DIR, exist_ok=True)

# # # # ========== Embeddings & LLM ==========
# # # llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, openai_api_key=OPENAI_API_KEY)
# # # embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
# # # chroma_db = Chroma(persist_directory=PERSIST_DIR, embedding_function=embeddings)

# # # # ========== App Data ==========
# # # user_memory: dict[str, BaseChatMessageHistory] = {}
# # # user_names = {}
# # # user_topics = {}

# # # # ========== Utilities ==========
# # # def get_session_history(session_id: str) -> BaseChatMessageHistory:
# # #     if session_id not in user_memory:
# # #         user_memory[session_id] = ChatMessageHistory()
# # #     return user_memory[session_id]

# # # def fuzzy_match(word: str, possibilities: list):
# # #     from difflib import get_close_matches
# # #     matches = get_close_matches(word, possibilities, n=1, cutoff=0.6)
# # #     return matches[0] if matches else None

# # # def select_topic(query: str) -> str | None:
# # #     q = query.lower()
# # #     if "python" in q: return "python"
# # #     if "javascript" in q or "js" in q: return "javascript"
# # #     if "html" in q: return "html"
# # #     if "css" in q: return "css"
# # #     return None

# # # # --- CHANGE: New function to check if re-indexing is needed ---
# # # def should_reindex():
# # #     """Checks if the PDFs on disk match the manifest."""
# # #     if not os.path.exists(MANIFEST_FILE):
# # #         return True, "Manifest not found."

# # #     with open(MANIFEST_FILE, 'r') as f:
# # #         indexed_manifest = json.load(f)

# # #     current_pdfs = []
# # #     for topic in TOPICS:
# # #         topic_path = os.path.join(PDF_BASE, topic)
# # #         if os.path.exists(topic_path):
# # #             current_pdfs.extend([os.path.join(topic, f) for f in os.listdir(topic_path) if f.lower().endswith('.pdf')])

# # #     if sorted(indexed_manifest) != sorted(current_pdfs):
# # #         return True, "PDFs on disk have changed."

# # #     return False, "No changes detected."


# # # # --- CHANGE: Indexing logic updated to write to the manifest ---
# # # def load_and_index(topic: str):
# # #     folder_path = os.path.join(PDF_BASE, topic)
# # #     if not os.path.exists(folder_path):
# # #         return []

# # #     loader = PyPDFDirectoryLoader(folder_path)
# # #     docs = loader.load()
# # #     if not docs:
# # #         return []

# # #     splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
# # #     chunks = splitter.split_documents(docs)

# # #     for chunk in chunks:
# # #         chunk.metadata["topic"] = topic

# # #     ids = [f"{os.path.basename(c.metadata['source'])}-{i}" for i, c in enumerate(chunks)]
# # #     chroma_db.add_documents(chunks, ids=ids)
# # #     print(f"INFO: Indexed {len(chunks)} chunks for topic '{topic}'")
    
# # #     # Return list of indexed files for this topic
# # #     return [os.path.join(topic, os.path.basename(doc.metadata['source'])) for doc in docs]

# # # @app.on_event("startup")
# # # async def startup_event():
# # #     print("Server starting up. Checking if indexing is required...")
    
# # #     reindex, reason = should_reindex()
# # #     if reindex:
# # #         print(f"INFO: Re-indexing required. Reason: {reason}")
# # #         all_indexed_files = []
# # #         for topic in TOPICS:
# # #             indexed_files_for_topic = load_and_index(topic)
# # #             all_indexed_files.extend(indexed_files_for_topic)
        
# # #         # Remove duplicates and write to manifest
# # #         with open(MANIFEST_FILE, 'w') as f:
# # #             json.dump(list(set(all_indexed_files)), f, indent=2)
# # #         print("INFO: Indexing complete.")
# # #     else:
# # #         print("INFO: Skipping indexing. All files are up to date.")
    
# # #     print("INFO: Server is ready.")

# # # # ... (rest of the file remains the same) ...

# # # # ========== Conversational Helpers ==========
# # # greeting_responses = ["Hello! How can I help you today?", "Hi there! Ready to learn something new?", "Hey! What would you like to ask?"]
# # # farewell_responses = ["Alright, talk to you later!", "Okay, take care!", "Bye! Have a good one.", "Catch you later!"]
# # # ok_responses = ["Alright.", "Okay, noted.", "Got it!", "Sure thing."]

# # # # ========== Core Conversational RAG Logic ==========
# # # def ask_question_logic(query: str, user_id: str = "default_user") -> str:
# # #     q = query.lower().strip()

# # #     # Quick conversational handlers
# # #     if fuzzy_match(q, ["hi", "hello", "hey"]): return random.choice(greeting_responses)
# # #     if fuzzy_match(q, ["bye", "goodbye", "see you", "later"]): return random.choice(farewell_responses)
# # #     if fuzzy_match(q, ["ok", "okay", "yes", "yep", "alright"]): return random.choice(ok_responses)
    
# # #     if re.match(r"^(who are you|what is your name|your name|who made you|what are you|introduce yourself)\??$", q):
# # #         return "I am XpertAi, made by CodeXpert. I am only available to assist with Python, JavaScript, HTML, and CSS for now.Kindly specify the language you are talking about "
    
# # #     name_match = re.search(r"(?:my name is|i am|i'm) (\w+)", q)
# # #     if name_match:
# # #         name = name_match.group(1).capitalize()
# # #         user_names[user_id] = name
# # #         return f"Nice to meet you, {name}! I’ll remember your name."
# # #     if "my name" in q or "who am i" in q:
# # #         return f"Your name is {user_names.get(user_id, 'I don`t know it yet')}."
    
# # #     if any(kw in q for kw in ["time", "date", "day", "month", "year"]):
# # #         now = datetime.now()
# # #         return f"The current date is {now.strftime('%A, %d %B %Y')} and time is {now.strftime('%I:%M %p')}."
    
# # #     # Topic selection and state management for accuracy
# # #     detected_topic = select_topic(query)
# # #     if detected_topic:
# # #         user_topics[user_id] = detected_topic
    
# # #     current_topic = user_topics.get(user_id)
# # #     if not current_topic:
# # #         return "I can help with Python, JavaScript, HTML, and CSS. Which topic are you interested in?"

# # #     # Main Conversational RAG Logic
# # #     try:
# # #         chat_history = get_session_history(user_id)

# # #         # Create a retriever filtered for the CURRENT TOPIC ONLY
# # #         topic_retriever = chroma_db.as_retriever(
# # #             search_kwargs={"k": 3, "filter": {'topic': current_topic}}
# # #         )

# # #         # Recreate the chain dynamically with the topic-specific retriever
# # #         contextualize_q_prompt = ChatPromptTemplate.from_messages([
# # #             ("system", "Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is."),
# # #             MessagesPlaceholder("chat_history"),
# # #             ("human", "{input}"),
# # #         ])
# # #         history_aware_retriever = create_history_aware_retriever(llm, topic_retriever, contextualize_q_prompt)

# # #         qa_prompt = ChatPromptTemplate.from_messages([
# # #             ("system", "You are XpertAi, a helpful coding assistant created by CodeXpert. Answer concisely and clearly using markdown and code blocks if needed, based on the provided context. If you don't know the answer from the context, just say that you don't know.\n\n-- CONTEXT:\n{context}"),
# # #             MessagesPlaceholder("chat_history"),
# # #             ("human", "{input}"),
# # #         ])
# # #         question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
# # #         rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

# # #         response = rag_chain.invoke({"input": query, "chat_history": chat_history.messages})
# # #         answer = response.get("answer", "Sorry, I couldn't find an answer.")

# # #         chat_history.add_user_message(query)
# # #         chat_history.add_ai_message(answer)
        
# # #         return answer.strip()
# # #     except Exception as e:
# # #         return f"ALERT: Error generating answer: {e}"


# # # # ========== Routes ==========
# # # @app.post("/ask")
# # # async def ask_endpoint(request: Request):
# # #     try:
# # #         data = await request.json()
# # #     except Exception:
# # #         return {"error": "Invalid JSON."}
# # #     query = data.get("query") or data.get("question") or data.get("q")
# # #     user_id = data.get("user_id") or "default_user"
# # #     if not query:
# # #         return {"error": "Empty query."}
# # #     answer = ask_question_logic(query, user_id)
# # #     return {"answer": answer}
    
# # # @app.post("/clear_history")
# # # async def clear_history_endpoint(request: Request):
# # #     try:
# # #         data = await request.json()
# # #         user_id = data.get("user_id") or "default_user"
# # #         if user_id in user_memory: del user_memory[user_id]
# # #         if user_id in user_topics: del user_topics[user_id]
# # #         return {"status": f"History for {user_id} cleared."}
# # #     except Exception:
# # #         return {"error": "Invalid JSON."}

# # # # ========== Helpers ==========
# # # def get_local_ip():
# # #     s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# # #     try:
# # #         s.connect(("8.8.8.8", 80))
# # #         ip = s.getsockname()[0]
# # #     except Exception:
# # #         ip = "127.0.0.1"
# # #     finally:
# # #         s.close()
# # #     return ip

# # # # ========== Run ==========
# # # if __name__ == "__main__":
# # #     ip = get_local_ip()
# # #     print(f"INFO: Server will run at http://{ip}:8000")
# # #     print("INFO: Use this IP on your mobile app (Android emulator uses 10.0.2.2).")
# # #     uvicorn.run(app, host="0.0.0.0", port=8000)
# # # main.py
# # # import os
# # # import socket
# # # import re
# # # import random
# # # import json 
# # # from typing import Optional
# # # from dotenv import load_dotenv
# # # from fastapi import FastAPI, Request
# # # from pydantic import BaseModel
# # # from datetime import datetime
# # # from langchain_community.document_loaders import PyPDFDirectoryLoader
# # # from langchain_text_splitters import RecursiveCharacterTextSplitter
# # # from langchain_openai import ChatOpenAI, OpenAIEmbeddings
# # # from langchain_chroma import Chroma
# # # from fastapi.middleware.cors import CORSMiddleware
# # # import uvicorn

# # # from langchain.chains import create_history_aware_retriever, create_retrieval_chain # pyright: ignore[reportMissingImports]
# # # from langchain.chains.combine_documents import create_stuff_documents_chain # pyright: ignore[reportMissingImports] # type: ignore
# # # from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# # # from langchain_core.chat_history import BaseChatMessageHistory
# # # from langchain_community.chat_message_histories import ChatMessageHistory
# # # from openai import OpenAI

# # # # ========== Load environment ==========
# # # load_dotenv()
# # # OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# # # if not OPENAI_API_KEY:
# # #     raise ValueError("ERROR: OPENAI_API_KEY not found! Add it to .env file as OPENAI_API_KEY=sk-...")

# # # # ========== FastAPI Setup ==========
# # # app = FastAPI()
# # # app.add_middleware(
# # #     CORSMiddleware,
# # #     allow_origins=["*"],
# # #     allow_credentials=True,
# # #     allow_methods=["*"],
# # #     allow_headers=["*"],
# # # )

# # # # --- ML / CODE CHECKER ADDITION: Pydantic Models ---
# # # class CodeRequest(BaseModel):
# # #     code: str
# # #     language: str
# # #     problem: str

# # # class CodeResponse(BaseModel):
# # #     is_correct: bool
# # #     error_type: Optional[str] = "None"
# # #     console_output: Optional[str] = ""

# # # # ========== Paths and Constants ==========
# # # BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# # # PERSIST_DIR = os.path.join(BASE_DIR, "chroma_db")
# # # PDF_BASE = os.path.join(BASE_DIR, "pdfs")
# # # TOPICS = ["python", "javascript", "html", "css"]
# # # MANIFEST_FILE = os.path.join(PERSIST_DIR, "indexed_files.json")
# # # os.makedirs(PERSIST_DIR, exist_ok=True)

# # # # ========== Embeddings & LLM (RAG) ==========
# # # llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, openai_api_key=OPENAI_API_KEY)
# # # embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
# # # chroma_db = Chroma(persist_directory=PERSIST_DIR, embedding_function=embeddings)

# # # # --- ML / CODE CHECKER ADDITION: Standard Client ---
# # # openai_client = OpenAI(api_key=OPENAI_API_KEY)

# # # # ========== App Data ==========
# # # user_memory: dict[str, BaseChatMessageHistory] = {}
# # # user_names = {}
# # # user_topics = {}

# # # # ========== Utilities ==========
# # # def get_session_history(session_id: str) -> BaseChatMessageHistory:
# # #     if session_id not in user_memory:
# # #         user_memory[session_id] = ChatMessageHistory()
# # #     return user_memory[session_id]

# # # def fuzzy_match(word: str, possibilities: list):
# # #     from difflib import get_close_matches
# # #     matches = get_close_matches(word, possibilities, n=1, cutoff=0.6)
# # #     return matches[0] if matches else None

# # # def select_topic(query: str) -> str | None:
# # #     q = query.lower()
# # #     if "python" in q: return "python"
# # #     if any(js in q for js in ["javascript", "js", "react", "node"]): return "javascript"
# # #     if "html" in q: return "html"
# # #     if "css" in q: return "css"
# # #     return None

# # # def should_reindex():
# # #     """Checks if the PDFs on disk match the manifest."""
# # #     if not os.path.exists(MANIFEST_FILE):
# # #         return True, "Manifest not found."

# # #     with open(MANIFEST_FILE, 'r') as f:
# # #         indexed_manifest = json.load(f)

# # #     current_pdfs = []
# # #     for topic in TOPICS:
# # #         topic_path = os.path.join(PDF_BASE, topic)
# # #         if os.path.exists(topic_path):
# # #             current_pdfs.extend([os.path.join(topic, f) for f in os.listdir(topic_path) if f.lower().endswith('.pdf')])

# # #     if sorted(indexed_manifest) != sorted(current_pdfs):
# # #         return True, "PDFs on disk have changed."

# # #     return False, "No changes detected."

# # # def load_and_index(topic: str):
# # #     folder_path = os.path.join(PDF_BASE, topic)
# # #     if not os.path.exists(folder_path):
# # #         return []

# # #     loader = PyPDFDirectoryLoader(folder_path)
# # #     docs = loader.load()
# # #     if not docs:
# # #         return []

# # #     splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
# # #     chunks = splitter.split_documents(docs)

# # #     for chunk in chunks:
# # #         chunk.metadata["topic"] = topic

# # #     ids = [f"{topic}-{os.path.basename(c.metadata['source'])}-{i}" for i, c in enumerate(chunks)]
# # #     chroma_db.add_documents(chunks, ids=ids)
# # #     print(f"INFO: Indexed {len(chunks)} chunks for topic '{topic}'")
    
# # #     # Return list of indexed files for this topic
# # #     return [os.path.join(topic, os.path.basename(doc.metadata['source'])) for doc in docs]

# # # @app.on_event("startup")
# # # async def startup_event():
# # #     print("Server starting up. Checking if indexing is required...")
    
# # #     reindex, reason = should_reindex()
# # #     if reindex:
# # #         print(f"INFO: Re-indexing required. Reason: {reason}")
# # #         all_indexed_files = []
# # #         for topic in TOPICS:
# # #             indexed_files_for_topic = load_and_index(topic)
# # #             all_indexed_files.extend(indexed_files_for_topic)
        
# # #         # Remove duplicates and write to manifest
# # #         with open(MANIFEST_FILE, 'w') as f:
# # #             json.dump(list(set(all_indexed_files)), f, indent=2)
# # #         print("INFO: Indexing complete.")
# # #     else:
# # #         print("INFO: Skipping indexing. All files are up to date.")
    
# # #     print("INFO: Server is ready.")

# # # # ========== Conversational Helpers ==========
# # # greeting_responses = ["Hello! How can I help you today?", "Hi there! Ready to learn something new?", "Hey! What would you like to ask?"]
# # # farewell_responses = ["Alright, talk to you later!", "Okay, take care!", "Bye! Have a good one.", "Catch you later!"]
# # # ok_responses = ["Alright.", "Okay, noted.", "Got it!", "Sure thing."]

# # # # ========== Core Conversational RAG Logic ==========
# # # def ask_question_logic(query: str, user_id: str = "default_user") -> str:
# # #     q = query.lower().strip()

# # #     # Quick conversational handlers
# # #     if fuzzy_match(q, ["hi", "hello", "hey"]): return random.choice(greeting_responses)
# # #     if fuzzy_match(q, ["bye", "goodbye", "see you", "later"]): return random.choice(farewell_responses)
# # #     if fuzzy_match(q, ["ok", "okay", "yes", "yep", "alright"]): return random.choice(ok_responses)
    
# # #     if re.match(r"^(who are you|what is your name|your name|who made you|what are you|introduce yourself)\??$", q):
# # #         return "I am XpertAi, made by CodeXpert. I am available to assist with Python, JavaScript, HTML, and CSS. Kindly specify the language you are talking about."
    
# # #     name_match = re.search(r"(?:my name is|i am|i'm) (\w+)", q)
# # #     if name_match:
# # #         name = name_match.group(1).capitalize()
# # #         user_names[user_id] = name
# # #         return f"Nice to meet you, {name}! I’ll remember your name."
    
# # #     if "my name" in q or "who am i" in q:
# # #         return f"Your name is {user_names.get(user_id, 'I don`t know it yet')}."
    
# # #     if any(kw in q for kw in ["time", "date", "day", "month", "year"]):
# # #         now = datetime.now()
# # #         return f"The current date is {now.strftime('%A, %d %B %Y')} and time is {now.strftime('%I:%M %p')}."
    
# # #     # Topic selection and state management for accuracy
# # #     detected_topic = select_topic(query)
# # #     if detected_topic:
# # #         user_topics[user_id] = detected_topic
    
# # #     current_topic = user_topics.get(user_id)
# # #     if not current_topic:
# # #         return "I can help with Python, JavaScript, HTML, and CSS. Which topic are you interested in?"

# # #     # Main Conversational RAG Logic
# # #     try:
# # #         chat_history = get_session_history(user_id)

# # #         # Create a retriever filtered for the CURRENT TOPIC ONLY
# # #         topic_retriever = chroma_db.as_retriever(
# # #             search_kwargs={"k": 3, "filter": {'topic': current_topic}}
# # #         )

# # #         # Recreate the chain dynamically with the topic-specific retriever
# # #         contextualize_q_prompt = ChatPromptTemplate.from_messages([
# # #             ("system", "Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is."),
# # #             MessagesPlaceholder("chat_history"),
# # #             ("human", "{input}"),
# # #         ])
# # #         history_aware_retriever = create_history_aware_retriever(llm, topic_retriever, contextualize_q_prompt)

# # #         qa_prompt = ChatPromptTemplate.from_messages([
# # #             ("system", "You are XpertAi, a helpful coding assistant created by CodeXpert. Answer concisely and clearly using markdown and code blocks if needed, based on the provided context. If you don't know the answer from the context, just say that you don't know.\n\n-- CONTEXT:\n{context}"),
# # #             MessagesPlaceholder("chat_history"),
# # #             ("human", "{input}"),
# # #         ])
# # #         question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
# # #         rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

# # #         response = rag_chain.invoke({"input": query, "chat_history": chat_history.messages})
# # #         answer = response.get("answer", "Sorry, I couldn't find an answer.")

# # #         chat_history.add_user_message(query)
# # #         chat_history.add_ai_message(answer)
        
# # #         return answer.strip()
# # #     except Exception as e:
# # #         return f"ALERT: Error generating answer: {e}"

# # # # --- ML / CODE CHECKER ADDITION: Core Logic ---
# # # def check_code_with_ai(user_code: str, language: str, problem: str):
# # #     lang_rules = {
# # #         "python": "Check for correct indentation and Python 3 syntax.",
# # #         "javascript": "Check for camelCase, semi-colons, and ES6+ syntax.",
# # #         "html": "Ensure proper tag nesting and standard structure.",
# # #         "css": "Check for correct selector syntax and valid properties."
# # #     }
    
# # #     prompt = f"""
# # #     You are a strict compiler for {language}. Specific rule: {lang_rules.get(language.lower(), "Standard syntax rules.")}
# # #     The user is solving: "{problem}"
    
# # #     Rules:
# # #     1. Does it compile? Does it solve the problem?
# # #     2. NEVER write the corrected code or give the exact solution.
# # #     3. Output ONLY valid JSON.
    
# # #     Format exactly like this:
# # #     {{
# # #       "is_correct": true or false,
# # #       "error_type": "None", "SyntaxError", or "LogicError",
# # #       "console_output": "The exact hint or error message."
# # #     }}
# # #     """

# # #     try:
# # #         response = openai_client.chat.completions.create(
# # #             model="gpt-4o-mini",
# # #             response_format={ "type": "json_object" }, 
# # #             messages=[
# # #                 {"role": "system", "content": prompt},
# # #                 {"role": "user", "content": user_code}
# # #             ],
# # #             temperature=0
# # #         )
# # #         return json.loads(response.choices[0].message.content)
        
# # #     except Exception as e:
# # #         return {
# # #             "is_correct": False,
# # #             "error_type": "ServerError",
# # #             "console_output": f"Could not connect to AI: {str(e)}"
# # #         }

# # # # ========== Routes ==========
# # # @app.post("/ask")
# # # async def ask_endpoint(request: Request):
# # #     try:
# # #         data = await request.json()
# # #     except Exception:
# # #         return {"error": "Invalid JSON."}
# # #     query = data.get("query") or data.get("question") or data.get("q")
# # #     user_id = data.get("user_id") or "default_user"
# # #     if not query:
# # #         return {"error": "Empty query."}
# # #     answer = ask_question_logic(query, user_id)
# # #     return {"answer": answer}
    
# # # @app.post("/clear_history")
# # # async def clear_history_endpoint(request: Request):
# # #     try:
# # #         data = await request.json()
# # #         user_id = data.get("user_id") or "default_user"
# # #         if user_id in user_memory: del user_memory[user_id]
# # #         if user_id in user_topics: del user_topics[user_id]
# # #         return {"status": f"History for {user_id} cleared."}
# # #     except Exception:
# # #         return {"error": "Invalid JSON."}

# # # # --- ML / CODE CHECKER ADDITION: Route ---
# # # @app.post("/api/submit-code", response_model=CodeResponse)
# # # async def submit_code_endpoint(request: CodeRequest):
# # #     ai_result = check_code_with_ai(request.code, request.language, request.problem)
    
# # #     # Safely handle None/null values from OpenAI to prevent 500 Pydantic errors
# # #     error_type = ai_result.get("error_type")
# # #     console_output = ai_result.get("console_output")
    
# # #     return CodeResponse(
# # #         is_correct=ai_result.get("is_correct", False),
# # #         error_type=str(error_type) if error_type is not None else "None",
# # #         console_output=str(console_output) if console_output is not None else "Evaluation complete."
# # #     )

# # # # ========== Helpers ==========
# # # def get_local_ip():
# # #     s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# # #     try:
# # #         s.connect(("8.8.8.8", 80))
# # #         ip = s.getsockname()[0]
# # #     except Exception:
# # #         ip = "127.0.0.1"
# # #     finally:
# # #         s.close()
# # #     return ip

# # # # ========== Run ==========
# # # if __name__ == "__main__":
# # #     ip = get_local_ip()
# # #     print(f"INFO: Server will run at http://{ip}:8000")
# # #     print("INFO: Use this IP on your mobile app (Android emulator uses 10.0.2.2).")
# # #     uvicorn.run(app, host="0.0.0.0", port=8000)
    
    
    
# #     # ==============================================================================
# # # PROJECT: CodeXpert Backend API
# # # AUTHOR: Mushaf Khalil
# # # DESCRIPTION: FastAPI backend handling AI code checking and conversational logic.
# # # ==============================================================================

# # import os
# # import socket
# # import re
# # import random
# # import json 
# # from typing import Optional

# # # --- Core Framework Imports ---
# # from dotenv import load_dotenv
# # from fastapi import FastAPI, Request
# # from pydantic import BaseModel
# # from datetime import datetime
# # from fastapi.middleware.cors import CORSMiddleware
# # import uvicorn

# # # --- LangChain & AI Imports ---
# # from langchain_community.document_loaders import PyPDFDirectoryLoader
# # from langchain_text_splitters import RecursiveCharacterTextSplitter
# # from langchain_openai import ChatOpenAI, OpenAIEmbeddings
# # from langchain_chroma import Chroma
# # from langchain_classic.chains import create_history_aware_retriever, create_retrieval_chain 
# # from langchain_classic.chains.combine_documents import create_stuff_documents_chain
# # from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# # from langchain_core.chat_history import BaseChatMessageHistory
# # from langchain_community.chat_message_histories import ChatMessageHistory
# # from openai import OpenAI

# # # ------------------------------------------------------------------------------
# # # Environment Variables & Security
# # # ------------------------------------------------------------------------------
# # load_dotenv()
# # OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# # # Stop the server immediately if the API key is missing to prevent hidden errors later
# # if not OPENAI_API_KEY:
# #     raise ValueError("ERROR: OPENAI_API_KEY not found! Add it to .env file as OPENAI_API_KEY=sk-...")

# # # ------------------------------------------------------------------------------
# # # FastAPI App Initialization
# # # ------------------------------------------------------------------------------
# # app = FastAPI()

# # # Allow the mobile app to talk to this backend without security blocks (CORS)
# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["*"],
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # # ------------------------------------------------------------------------------
# # # Data Models (Structuring the data sent from the mobile app)
# # # ------------------------------------------------------------------------------
# # class CodeRequest(BaseModel):
# #     code: str
# #     language: str
# #     problem: str

# # class CodeResponse(BaseModel):
# #     is_correct: bool
# #     error_type: Optional[str] = "None"
# #     console_output: Optional[str] = ""

# # # ------------------------------------------------------------------------------
# # # Directories and Constants
# # # ------------------------------------------------------------------------------
# # BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# # PERSIST_DIR = os.path.join(BASE_DIR, "chroma_db")  # Where the vector database lives
# # PDF_BASE = os.path.join(BASE_DIR, "pdfs")          # Where your learning materials are stored
# # TOPICS = ["python", "javascript", "html", "css"]
# # MANIFEST_FILE = os.path.join(PERSIST_DIR, "indexed_files.json")

# # # Ensure the database folder exists when the app starts
# # os.makedirs(PERSIST_DIR, exist_ok=True)

# # # ------------------------------------------------------------------------------
# # # AI Models & Vector Database Setup
# # # ------------------------------------------------------------------------------
# # # Using a low temperature (0.2) so the AI relies on facts rather than guessing
# # llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, openai_api_key=OPENAI_API_KEY)
# # embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
# # chroma_db = Chroma(persist_directory=PERSIST_DIR, embedding_function=embeddings)

# # # Standard OpenAI client specifically for the interactive code-checking logic
# # openai_client = OpenAI(api_key=OPENAI_API_KEY)

# # # ------------------------------------------------------------------------------
# # # User State Management (Temporary Memory)
# # # ------------------------------------------------------------------------------
# # user_memory: dict[str, BaseChatMessageHistory] = {}
# # user_names = {}
# # user_topics = {}

# # def get_session_history(session_id: str) -> BaseChatMessageHistory:
# #     """Creates a new chat history if the user doesn't have one active yet."""
# #     if session_id not in user_memory:
# #         user_memory[session_id] = ChatMessageHistory()
# #     return user_memory[session_id]

# # def fuzzy_match(word: str, possibilities: list):
# #     """Helps catch minor typos when checking for common words like 'hello'."""
# #     from difflib import get_close_matches
# #     matches = get_close_matches(word, possibilities, n=1, cutoff=0.6)
# #     return matches[0] if matches else None

# # def select_topic(query: str) -> str | None:
# #     """Figures out which programming language the user is asking about based on their text."""
# #     q = query.lower()
# #     if "python" in q: return "python"
# #     if any(js in q for js in ["javascript", "js", "react", "node"]): return "javascript"
# #     if "html" in q: return "html"
# #     if "css" in q: return "css"
# #     return None

# # # ------------------------------------------------------------------------------
# # # PDF Indexing & Database Management
# # # ------------------------------------------------------------------------------
# # def should_reindex():
# #     """Checks if the PDFs on disk match the manifest to save time and API costs."""
# #     if not os.path.exists(MANIFEST_FILE):
# #         return True, "Manifest not found."

# #     with open(MANIFEST_FILE, 'r') as f:
# #         indexed_manifest = json.load(f)

# #     current_pdfs = []
# #     for topic in TOPICS:
# #         topic_path = os.path.join(PDF_BASE, topic)
# #         if os.path.exists(topic_path):
# #             current_pdfs.extend([os.path.join(topic, f) for f in os.listdir(topic_path) if f.lower().endswith('.pdf')])

# #     if sorted(indexed_manifest) != sorted(current_pdfs):
# #         return True, "PDFs on disk have changed."

# #     return False, "No changes detected."

# # def load_and_index(topic: str):
# #     """Loads PDFs, breaks them into small chunks, and saves them to ChromaDB."""
# #     folder_path = os.path.join(PDF_BASE, topic)
# #     if not os.path.exists(folder_path):
# #         return []

# #     loader = PyPDFDirectoryLoader(folder_path)
# #     docs = loader.load()
# #     if not docs:
# #         return []

# #     # Break text into chunks of 1000 characters with 200 character overlap so context isn't lost
# #     splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
# #     chunks = splitter.split_documents(docs)

# #     for chunk in chunks:
# #         chunk.metadata["topic"] = topic

# #     ids = [f"{topic}-{os.path.basename(c.metadata['source'])}-{i}" for i, c in enumerate(chunks)]
# #     chroma_db.add_documents(chunks, ids=ids)
# #     print(f"INFO: Indexed {len(chunks)} chunks for topic '{topic}'")
    
# #     # Return list of indexed files for this topic so we can save it to the manifest
# #     return [os.path.join(topic, os.path.basename(doc.metadata['source'])) for doc in docs]

# # @app.on_event("startup")
# # async def startup_event():
# #     """Runs automatically when the server boots up to prepare the document database."""
# #     print("Server starting up. Checking if indexing is required...")
    
# #     reindex, reason = should_reindex()
# #     if reindex:
# #         print(f"INFO: Re-indexing required. Reason: {reason}")
# #         all_indexed_files = []
# #         for topic in TOPICS:
# #             indexed_files_for_topic = load_and_index(topic)
# #             all_indexed_files.extend(indexed_files_for_topic)
        
# #         # Save a list of what we just indexed so we don't do it again next time unnecessarily
# #         with open(MANIFEST_FILE, 'w') as f:
# #             json.dump(list(set(all_indexed_files)), f, indent=2)
# #         print("INFO: Indexing complete.")
# #     else:
# #         print("INFO: Skipping indexing. All files are up to date.")
    
# #     print("INFO: Server is ready.")

# # # ------------------------------------------------------------------------------
# # # Conversational Logic and Chat Routing
# # # ------------------------------------------------------------------------------
# # greeting_responses = ["Hello! How can I help you today?", "Hi there! Ready to learn something new?", "Hey! What would you like to ask?"]
# # farewell_responses = ["Alright, talk to you later!", "Okay, take care!", "Bye! Have a good one.", "Catch you later!"]
# # ok_responses = ["Alright.", "Okay, noted.", "Got it!", "Sure thing."]

# # def ask_question_logic(query: str, user_id: str = "default_user") -> str:
# #     """The main brain of the chatbot. Handles general chat and searches through the PDFs."""
# #     q = query.lower().strip()

# #     # Quick conversational handlers so we don't waste API calls on simple greetings
# #     if fuzzy_match(q, ["hi", "hello", "hey"]): return random.choice(greeting_responses)
# #     if fuzzy_match(q, ["bye", "goodbye", "see you", "later"]): return random.choice(farewell_responses)
# #     if fuzzy_match(q, ["ok", "okay", "yes", "yep", "alright"]): return random.choice(ok_responses)
    
# #     if re.match(r"^(who are you|what is your name|your name|who made you|what are you|introduce yourself)\??$", q):
# #         return " Hello there! I am XpertAi, made by CodeXpert. I am available to assist with Python, JavaScript, HTML, and CSS for now. Kindly specify the language you are talking about."
    
# #     # Simple logic to extract and remember the user's name
# #     name_match = re.search(r"(?:my name is|i am|i'm) (\w+)", q)
# #     if name_match:
# #         name = name_match.group(1).capitalize()
# #         user_names[user_id] = name
# #         return f"Nice to meet you, {name}! I’ll remember your name."
    
# #     if "my name" in q or "who am i" in q:
# #         return f"Your name is {user_names.get(user_id, 'I don`t know it yet')}."
    
# #     # Handle current date and time requests
# #     if any(kw in q for kw in ["time", "date", "day", "month", "year"]):
# #         now = datetime.now()
# #         return f"The current date is {now.strftime('%A, %d %B %Y')} and time is {now.strftime('%I:%M %p')}."
    
# #     # Update our current topic if the user mentions a specific language
# #     detected_topic = select_topic(query)
# #     if detected_topic:
# #         user_topics[user_id] = detected_topic
    
# #     current_topic = user_topics.get(user_id)
# #     if not current_topic:
# #         return "I can help with Python, JavaScript, HTML, and CSS. Which topic are you interested in?"

# #     # Pulling from the LangChain document retrieval logic
# #     try:
# #         chat_history = get_session_history(user_id)

# #         # Only pull information from the PDFs related to the current programming language
# #         topic_retriever = chroma_db.as_retriever(
# #             search_kwargs={"k": 3, "filter": {'topic': current_topic}}
# #         )

# #         # Reformulate the question to make sense on its own if it refers to past messages
# #         contextualize_q_prompt = ChatPromptTemplate.from_messages([
# #             ("system", "Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is."),
# #             MessagesPlaceholder("chat_history"),
# #             ("human", "{input}"),
# #         ])
# #         history_aware_retriever = create_history_aware_retriever(llm, topic_retriever, contextualize_q_prompt)

# #         # The actual prompt that instructs the AI on how to answer based on the retrieved text
# #         qa_prompt = ChatPromptTemplate.from_messages([
# #             ("system", "You are XpertAi, a helpful coding assistant created by CodeXpert. Answer concisely and clearly using markdown and code blocks if needed, based on the provided context. If you don't know the answer from the context, just say that you don't know.\n\n-- CONTEXT:\n{context}"),
# #             MessagesPlaceholder("chat_history"),
# #             ("human", "{input}"),
# #         ])
# #         question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
# #         rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

# #         # Execute the search and generate the answer
# #         response = rag_chain.invoke({"input": query, "chat_history": chat_history.messages})
# #         answer = response.get("answer", "Sorry, I couldn't find an answer.")

# #         # Save this interaction to memory so it remembers it for the next question
# #         chat_history.add_user_message(query)
# #         chat_history.add_ai_message(answer)
        
# #         return answer.strip()
# #     except Exception as e:
# #         return f"ALERT: Error generating answer: {e}"

# # # ------------------------------------------------------------------------------
# # # Automated Code Checker Logic
# # # ------------------------------------------------------------------------------
# # def check_code_with_ai(user_code: str, language: str, problem: str):
# #     """Acts as a strict compiler to check user code without giving away the exact answer."""
# #     lang_rules = {
# #         "python": "Check for correct indentation and Python 3 syntax.",
# #         "javascript": "Check for camelCase, semi-colons, and ES6+ syntax.",
# #         "html": "Ensure proper tag nesting and standard structure.",
# #         "css": "Check for correct selector syntax and valid properties."
# #     }
    
# #     prompt = f"""
# #     You are a strict compiler for {language}. Specific rule: {lang_rules.get(language.lower(), "Standard syntax rules.")}
# #     The user is solving: "{problem}"
    
# #     Rules:
# #     1. Does it compile? Does it solve the problem?
# #     2. NEVER write the corrected code or give the exact solution.
# #     3. Output ONLY valid JSON.
    
# #     Format exactly like this:
# #     {{
# #       "is_correct": true or false,
# #       "error_type": "None", "SyntaxError", or "LogicError",
# #       "console_output": "The exact hint or error message."
# #     }}
# #     """

# #     try:
# #         response = openai_client.chat.completions.create(
# #             model="gpt-4o-mini",
# #             response_format={ "type": "json_object" }, 
# #             messages=[
# #                 {"role": "system", "content": prompt},
# #                 {"role": "user", "content": user_code}
# #             ],
# #             temperature=0
# #         )
# #         return json.loads(response.choices[0].message.content)
        
# #     except Exception as e:
# #         return {
# #             "is_correct": False,
# #             "error_type": "ServerError",
# #             "console_output": f"Could not connect to AI: {str(e)}"
# #         }

# # # ------------------------------------------------------------------------------
# # # API Routes (Endpoints for the Mobile App to Connect To)
# # # ------------------------------------------------------------------------------
# # @app.post("/ask")
# # async def ask_endpoint(request: Request):
# #     """Endpoint for general questions and document lookups."""
# #     try:
# #         data = await request.json()
# #     except Exception:
# #         return {"error": "Invalid JSON."}
# #     query = data.get("query") or data.get("question") or data.get("q")
# #     user_id = data.get("user_id") or "default_user"
# #     if not query:
# #         return {"error": "Empty query."}
# #     answer = ask_question_logic(query, user_id)
# #     return {"answer": answer}
    
# # @app.post("/clear_history")
# # async def clear_history_endpoint(request: Request):
# #     """Endpoint to wipe a user's current chat memory if they want to start fresh."""
# #     try:
# #         data = await request.json()
# #         user_id = data.get("user_id") or "default_user"
# #         if user_id in user_memory: del user_memory[user_id]
# #         if user_id in user_topics: del user_topics[user_id]
# #         return {"status": f"History for {user_id} cleared."}
# #     except Exception:
# #         return {"error": "Invalid JSON."}

# # @app.post("/api/submit-code", response_model=CodeResponse)
# # async def submit_code_endpoint(request: CodeRequest):
# #     """Endpoint that receives code from the mobile app and passes it to the AI checker."""
# #     ai_result = check_code_with_ai(request.code, request.language, request.problem)
    
# #     # Safely handle None/null values from OpenAI to prevent server crashes
# #     error_type = ai_result.get("error_type")
# #     console_output = ai_result.get("console_output")
    
# #     return CodeResponse(
# #         is_correct=ai_result.get("is_correct", False),
# #         error_type=str(error_type) if error_type is not None else "None",
# #         console_output=str(console_output) if console_output is not None else "Evaluation complete."
# #     )

# # # ------------------------------------------------------------------------------
# # # Local Network Setup & Server Run
# # # ------------------------------------------------------------------------------
# # def get_local_ip():
# #     """Finds your computer's local IP address so your phone can connect to it over Wi-Fi."""
# #     s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# #     try:
# #         s.connect(("8.8.8.8", 80))
# #         ip = s.getsockname()[0]
# #     except Exception:
# #         ip = "127.0.0.1"
# #     finally:
# #         s.close()
# #     return ip

# # if __name__ == "__main__":
# #     ip = get_local_ip()
# #     print(f"INFO: Server will run at http://{ip}:8000")
# #     print("INFO: Use this IP on your mobile app (Android emulator uses 10.0.2.2).")
# #     uvicorn.run(app, host="0.0.0.0", port=8000)


# # ==============================================================================
# # PROJECT: CodeXpert Backend API
# # AUTHOR: Mushaf Khalil
# # DESCRIPTION: FastAPI backend handling AI code checking and conversational logic.
# # ==============================================================================

# import os
# import socket
# import re
# import random
# import json 
# from typing import Optional
# from pinecone import Pinecone

# # --- Core Framework Imports ---
# from dotenv import load_dotenv
# from fastapi import FastAPI, Request
# from pydantic import BaseModel
# from datetime import datetime
# from fastapi.middleware.cors import CORSMiddleware
# import uvicorn

# # --- LangChain & AI Imports ---
# from langchain_community.document_loaders import PyPDFDirectoryLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_openai import ChatOpenAI, OpenAIEmbeddings
# from langchain_chroma import Chroma
# from langchain_classic.chains import create_history_aware_retriever, create_retrieval_chain 
# from langchain_classic.chains.combine_documents import create_stuff_documents_chain
# from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# from langchain_core.chat_history import BaseChatMessageHistory
# from langchain_community.chat_message_histories import ChatMessageHistory
# from openai import OpenAI

# # ------------------------------------------------------------------------------
# # Environment Variables & Security
# # ------------------------------------------------------------------------------
# load_dotenv()
# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# # Stop the server immediately if the API key is missing to prevent hidden errors later
# if not OPENAI_API_KEY:
#     raise ValueError("ERROR: OPENAI_API_KEY not found! Add it to .env file as OPENAI_API_KEY=sk-...")

# # ------------------------------------------------------------------------------
# # FastAPI App Initialization
# # ------------------------------------------------------------------------------
# app = FastAPI()

# # Allow the mobile app to talk to this backend without security blocks (CORS)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ------------------------------------------------------------------------------
# # Data Models (Structuring the data sent from the mobile app)
# # ------------------------------------------------------------------------------
# class CodeRequest(BaseModel):
#     code: str
#     language: str
#     problem: str

# class CodeResponse(BaseModel):
#     is_correct: bool
#     error_type: Optional[str] = "None"
#     console_output: Optional[str] = ""

# # ------------------------------------------------------------------------------
# # Directories and Constants
# # ------------------------------------------------------------------------------
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# PERSIST_DIR = os.path.join(BASE_DIR, "chroma_db")  # Where the local vector database lives
# PDF_BASE = os.path.join(BASE_DIR, "pdfs")          # Where your learning materials are stored
# TOPICS = ["python", "javascript", "html", "css"]

# # Moved manifest to BASE_DIR so it uploads to GitHub and prevents Render from re-indexing
# MANIFEST_FILE = os.path.join(BASE_DIR, "indexed_files.json")

# # Ensure the database folder exists when the app starts locally
# os.makedirs(PERSIST_DIR, exist_ok=True)

# # ------------------------------------------------------------------------------
# # AI Models & DYNAMIC Vector Database Setup
# # ------------------------------------------------------------------------------
# # Using a low temperature (0.2) so the AI relies on facts rather than guessing
# llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, openai_api_key=OPENAI_API_KEY)
# embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)

# # Detect if the app is running on Render cloud
# IS_RENDER = os.getenv("RENDER") is not None

# if IS_RENDER:
#     # CLOUD MODE: Connect to Pinecone free tier
#     from langchain_pinecone import PineconeVectorStore
#     if not os.getenv("PINECONE_API_KEY"):
#         print("WARNING: PINECONE_API_KEY is missing from Render Environment Variables!")
    
#     print("INFO: Cloud environment detected. Using Pinecone Vector Database.")
#     vector_store = PineconeVectorStore(index_name="codexpert", embedding=embeddings)
# else:
#     # LAPTOP MODE: Connect to local ChromaDB
#     print("INFO: Local environment detected. Using Chroma Vector Database.")
#     vector_store = Chroma(persist_directory=PERSIST_DIR, embedding_function=embeddings)

# # Standard OpenAI client specifically for the interactive code-checking logic
# openai_client = OpenAI(api_key=OPENAI_API_KEY)

# # ------------------------------------------------------------------------------
# # User State Management (Temporary Memory)
# # ------------------------------------------------------------------------------
# user_memory: dict[str, BaseChatMessageHistory] = {}
# user_names = {}
# user_topics = {}

# def get_session_history(session_id: str) -> BaseChatMessageHistory:
#     """Creates a new chat history if the user doesn't have one active yet."""
#     if session_id not in user_memory:
#         user_memory[session_id] = ChatMessageHistory()
#     return user_memory[session_id]

# def fuzzy_match(word: str, possibilities: list):
#     """Helps catch minor typos when checking for common words like 'hello'."""
#     from difflib import get_close_matches
#     matches = get_close_matches(word, possibilities, n=1, cutoff=0.6)
#     return matches[0] if matches else None

# def select_topic(query: str) -> str | None:
#     """Figures out which programming language the user is asking about based on their text."""
#     q = query.lower()
#     if "python" in q: return "python"
#     if any(js in q for js in ["javascript", "js", "react", "node"]): return "javascript"
#     if "html" in q: return "html"
#     if "css" in q: return "css"
#     return None

# # ------------------------------------------------------------------------------
# # PDF Indexing & Database Management
# # ------------------------------------------------------------------------------
# def should_reindex():
#     """Checks if the PDFs on disk match the manifest to save time and API costs."""
#     if not os.path.exists(MANIFEST_FILE):
#         return True, "Manifest not found."

#     with open(MANIFEST_FILE, 'r') as f:
#         indexed_manifest = json.load(f)

#     current_pdfs = []
#     for topic in TOPICS:
#         topic_path = os.path.join(PDF_BASE, topic)
#         if os.path.exists(topic_path):
#             current_pdfs.extend([os.path.join(topic, f) for f in os.listdir(topic_path) if f.lower().endswith('.pdf')])

#     if sorted(indexed_manifest) != sorted(current_pdfs):
#         return True, "PDFs on disk have changed."

#     return False, "No changes detected."

# def load_and_index(topic: str):
#     """Loads PDFs, breaks them into small chunks, and saves them to the active vector DB."""
#     folder_path = os.path.join(PDF_BASE, topic)
#     if not os.path.exists(folder_path):
#         return []

#     loader = PyPDFDirectoryLoader(folder_path)
#     docs = loader.load()
#     if not docs:
#         return []

#     # Break text into chunks of 1000 characters with 200 character overlap so context isn't lost
#     splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
#     chunks = splitter.split_documents(docs)

#     for chunk in chunks:
#         chunk.metadata["topic"] = topic

#     ids = [f"{topic}-{os.path.basename(c.metadata['source'])}-{i}" for i, c in enumerate(chunks)]
    
#     # Save to either Pinecone or Chroma dynamically based on environment
#     vector_store.add_documents(chunks, ids=ids)
#     print(f"INFO: Indexed {len(chunks)} chunks for topic '{topic}'")
    
#     # Return list of indexed files for this topic so we can save it to the manifest
#     return [os.path.join(topic, os.path.basename(doc.metadata['source'])) for doc in docs]

# @app.on_event("startup")
# async def startup_event():
#     """Runs automatically when the server boots up to prepare the document database."""
#     print("Server starting up. Checking if indexing is required...")
    
#     reindex, reason = should_reindex()
#     if reindex:
#         print(f"INFO: Re-indexing required. Reason: {reason}")
#         all_indexed_files = []
#         for topic in TOPICS:
#             indexed_files_for_topic = load_and_index(topic)
#             all_indexed_files.extend(indexed_files_for_topic)
        
#         # Save a list of what we just indexed so we don't do it again next time unnecessarily
#         with open(MANIFEST_FILE, 'w') as f:
#             json.dump(list(set(all_indexed_files)), f, indent=2)
#         print("INFO: Indexing complete.")
#     else:
#         print("INFO: Skipping indexing. All files are up to date.")
    
#     print("INFO: Server is ready.")

# # ------------------------------------------------------------------------------
# # Conversational Logic and Chat Routing
# # ------------------------------------------------------------------------------
# greeting_responses = ["Hello! How can I help you today?", "Hi there! Ready to learn something new?", "Hey! What would you like to ask?"]
# farewell_responses = ["Alright, talk to you later!", "Okay, take care!", "Bye! Have a good one.", "Catch you later!"]
# ok_responses = ["Alright.", "Okay, noted.", "Got it!", "Sure thing."]

# def ask_question_logic(query: str, user_id: str = "default_user") -> str:
#     """The main brain of the chatbot. Handles general chat and searches through the PDFs."""
#     q = query.lower().strip()

#     # Quick conversational handlers so we don't waste API calls on simple greetings
#     if fuzzy_match(q, ["hi", "hello", "hey"]): return random.choice(greeting_responses)
#     if fuzzy_match(q, ["bye", "goodbye", "see you", "later"]): return random.choice(farewell_responses)
#     if fuzzy_match(q, ["ok", "okay", "yes", "yep", "alright"]): return random.choice(ok_responses)
    
#     if re.match(r"^(who are you|what is your name|your name|who made you|what are you|introduce yourself)\??$", q):
#         return " Hello there! I am XpertAi, made by CodeXpert. I am available to assist with Python, JavaScript, HTML, and CSS for now. Kindly specify the language you are talking about."
    
#     # Simple logic to extract and remember the user's name
#     name_match = re.search(r"(?:my name is|i am|i'm) (\w+)", q)
#     if name_match:
#         name = name_match.group(1).capitalize()
#         user_names[user_id] = name
#         return f"Nice to meet you, {name}! I’ll remember your name."
    
#     if "my name" in q or "who am i" in q:
#         return f"Your name is {user_names.get(user_id, 'I don`t know it yet')}."
    
#     # Handle current date and time requests
#     if any(kw in q for kw in ["time", "date", "day", "month", "year"]):
#         now = datetime.now()
#         return f"The current date is {now.strftime('%A, %d %B %Y')} and time is {now.strftime('%I:%M %p')}."
    
#     # Update our current topic if the user mentions a specific language
#     detected_topic = select_topic(query)
#     if detected_topic:
#         user_topics[user_id] = detected_topic
    
#     current_topic = user_topics.get(user_id)
#     if not current_topic:
#         return "I can help with Python, JavaScript, HTML, and CSS. Which topic are you interested in?"

#     # Pulling from the LangChain document retrieval logic
#     try:
#         chat_history = get_session_history(user_id)

#         # Retrieve documents using the dynamically selected vector database
#         topic_retriever = vector_store.as_retriever(
#             search_kwargs={"k": 3, "filter": {'topic': current_topic}}
#         )

#         # Reformulate the question to make sense on its own if it refers to past messages
#         contextualize_q_prompt = ChatPromptTemplate.from_messages([
#             ("system", "Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is."),
#             MessagesPlaceholder("chat_history"),
#             ("human", "{input}"),
#         ])
#         history_aware_retriever = create_history_aware_retriever(llm, topic_retriever, contextualize_q_prompt)

#         # The actual prompt that instructs the AI on how to answer based on the retrieved text
#         qa_prompt = ChatPromptTemplate.from_messages([
#             ("system", "You are XpertAi, a helpful coding assistant created by CodeXpert. Answer concisely and clearly using markdown and code blocks if needed, based on the provided context. If you don't know the answer from the context, just say that you don't know.\n\nCONETXT:\n{context}"),
#             MessagesPlaceholder("chat_history"),
#             ("human", "{input}"),
#         ])
#         question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
#         rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

#         # Execute the search and generate the answer
#         response = rag_chain.invoke({"input": query, "chat_history": chat_history.messages})
#         answer = response.get("answer", "Sorry, I couldn't find an answer.")

#         # Save this interaction to memory so it remembers it for the next question
#         chat_history.add_user_message(query)
#         chat_history.add_ai_message(answer)
        
#         return answer.strip()
#     except Exception as e:
#         return f"ALERT: Error generating answer: {e}"

# # ------------------------------------------------------------------------------
# # Automated Code Checker Logic
# # ------------------------------------------------------------------------------
# def check_code_with_ai(user_code: str, language: str, problem: str):
#     """Acts as a strict compiler to check user code without giving away the exact answer."""
#     lang_rules = {
#         "python": "Check for correct indentation and Python 3 syntax.",
#         "javascript": "Check for camelCase, semi-colons, and ES6+ syntax.",
#         "html": "Ensure proper tag nesting and standard structure.",
#         "css": "Check for correct selector syntax and valid properties."
#     }
    
#     prompt = f"""
#     You are a strict compiler for {language}. Specific rule: {lang_rules.get(language.lower(), "Standard syntax rules.")}
#     The user is solving: "{problem}"
    
#     Rules:
#     1. Does it compile? Does it solve the problem?
#     2. NEVER write the corrected code or give the exact solution.
#     3. Output ONLY valid JSON.
    
#     Format exactly like this:
#     {{
#       "is_correct": true or false,
#       "error_type": "None", "SyntaxError", or "LogicError",
#       "console_output": "The exact hint or error message."
#     }}
#     """

#     try:
#         response = openai_client.chat.completions.create(
#             model="gpt-4o-mini",
#             response_format={ "type": "json_object" }, 
#             messages=[
#                 {"role": "system", "content": prompt},
#                 {"role": "user", "content": user_code}
#             ],
#             temperature=0
#         )
#         return json.loads(response.choices[0].message.content)
        
#     except Exception as e:
#         return {
#             "is_correct": False,
#             "error_type": "ServerError",
#             "console_output": f"Could not connect to AI: {str(e)}"
#         }

# # ------------------------------------------------------------------------------
# # API Routes (Endpoints for the Mobile App to Connect To)
# # ------------------------------------------------------------------------------
# @app.post("/ask")
# async def ask_endpoint(request: Request):
#     """Endpoint for general questions and document lookups."""
#     try:
#         data = await request.json()
#     except Exception:
#         return {"error": "Invalid JSON."}
#     query = data.get("query") or data.get("question") or data.get("q")
#     user_id = data.get("user_id") or "default_user"
#     if not query:
#         return {"error": "Empty query."}
#     answer = ask_question_logic(query, user_id)
#     return {"answer": answer}
    
# @app.post("/clear_history")
# async def clear_history_endpoint(request: Request):
#     """Endpoint to wipe a user's current chat memory if they want to start fresh."""
#     try:
#         data = await request.json()
#         user_id = data.get("user_id") or "default_user"
#         if user_id in user_memory: del user_memory[user_id]
#         if user_id in user_topics: del user_topics[user_id]
#         return {"status": f"History for {user_id} cleared."}
#     except Exception:
#         return {"error": "Invalid JSON."}

# @app.post("/api/submit-code", response_model=CodeResponse)
# async def submit_code_endpoint(request: CodeRequest):
#     """Endpoint that receives code from the mobile app and passes it to the AI checker."""
#     ai_result = check_code_with_ai(request.code, request.language, request.problem)
    
#     # Safely handle None/null values from OpenAI to prevent server crashes
#     error_type = ai_result.get("error_type")
#     console_output = ai_result.get("console_output")
    
#     return CodeResponse(
#         is_correct=ai_result.get("is_correct", False),
#         error_type=str(error_type) if error_type is not None else "None",
#         console_output=str(console_output) if console_output is not None else "Evaluation complete."
#     )

# # ------------------------------------------------------------------------------
# # Local Network Setup & Server Run
# # ------------------------------------------------------------------------------
# def get_local_ip():
#     """Finds your computer's local IP address so your phone can connect to it over Wi-Fi."""
#     s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
#     try:
#         s.connect(("8.8.8.8", 80))
#         ip = s.getsockname()[0]
#     except Exception:
#         ip = "127.0.0.1"
#     finally:
#         s.close()
#     return ip

# if __name__ == "__main__":
#     ip = get_local_ip()
#     print(f"INFO: Server will run at http://{ip}:8000")
#     print("INFO: Use this IP on your mobile app (Android emulator uses 10.0.2.2).")
#     uvicorn.run(app, host="0.0.0.0", port=8000)
# ==============================================================================
# PROJECT: CodeXpert Backend API
# AUTHOR: Mushaf Khalil
# DESCRIPTION: FastAPI backend handling AI code checking and conversational logic.
# ==============================================================================

import os
import socket
import re
import random
import json 
from typing import Optional

# --- Core Framework Imports ---
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from pydantic import BaseModel
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# --- LangChain & AI Imports ---
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_pinecone import PineconeVectorStore  # Explicitly imported Pinecone
from langchain_classic.chains import create_history_aware_retriever, create_retrieval_chain 
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from openai import OpenAI

# ------------------------------------------------------------------------------
# Environment Variables & Security
# ------------------------------------------------------------------------------
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

# Stop the server immediately if the API key is missing to prevent hidden errors later
if not OPENAI_API_KEY:
    raise ValueError("ERROR: OPENAI_API_KEY not found! Add it to .env file as OPENAI_API_KEY=sk-...")

# ------------------------------------------------------------------------------
# FastAPI App Initialization
# ------------------------------------------------------------------------------
app = FastAPI()

# Allow the mobile app to talk to this backend without security blocks (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Data Models (Structuring the data sent from the mobile app)
# ------------------------------------------------------------------------------
class CodeRequest(BaseModel):
    code: str
    language: str
    problem: str

class CodeResponse(BaseModel):
    is_correct: bool
    error_type: Optional[str] = "None"
    console_output: Optional[str] = ""

# ------------------------------------------------------------------------------
# Directories and Constants
# ------------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PERSIST_DIR = os.path.join(BASE_DIR, "chroma_db")  # Where the local vector database lives
PDF_BASE = os.path.join(BASE_DIR, "pdfs")          # Where your learning materials are stored
TOPICS = ["python", "javascript", "html", "css"]

# Moved manifest to BASE_DIR so it uploads to GitHub and prevents Render from re-indexing
MANIFEST_FILE = os.path.join(BASE_DIR, "indexed_files.json")

# Ensure the database folder exists when the app starts locally
os.makedirs(PERSIST_DIR, exist_ok=True)

# ------------------------------------------------------------------------------
# AI Models & DUAL Vector Database Setup
# ------------------------------------------------------------------------------
# Using a low temperature (0.2) so the AI relies on facts rather than guessing
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, openai_api_key=OPENAI_API_KEY)
embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)

# Always initialize the local ChromaDB
print("INFO: Initializing local Chroma Vector Database.")
chroma_store = Chroma(persist_directory=PERSIST_DIR, embedding_function=embeddings)

pinecone_store = None

# If a Pinecone key exists, initialize it so we can push data to it,
# and set it as the primary database for answering questions.
if PINECONE_API_KEY:
    from pinecone import Pinecone
    print("INFO: Pinecone API Key detected. Initializing cloud connection...")
    
    # Initialize Pinecone explicitly
    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    # Ensure this matches your index name on the Pinecone dashboard
    index_name = "codexpert" 
    
    print(f"INFO: Connected! Using Pinecone Vector Database for active queries (Index: {index_name}).")
    pinecone_store = PineconeVectorStore(index_name=index_name, embedding=embeddings)
    
    # We will use Pinecone to answer questions if available
    active_vector_store = pinecone_store
else:
    print("INFO: No Pinecone key found in .env. Using local Chroma Vector Database for active queries.")
    # Fallback to Chroma if Pinecone isn't configured
    active_vector_store = chroma_store

# Standard OpenAI client specifically for the interactive code-checking logic
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# ------------------------------------------------------------------------------
# User State Management (Temporary Memory)
# ------------------------------------------------------------------------------
user_memory: dict[str, BaseChatMessageHistory] = {}
user_names = {}
user_topics = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    """Creates a new chat history if the user doesn't have one active yet."""
    if session_id not in user_memory:
        user_memory[session_id] = ChatMessageHistory()
    return user_memory[session_id]

def fuzzy_match(word: str, possibilities: list):
    """Helps catch minor typos when checking for common words like 'hello'."""
    from difflib import get_close_matches
    matches = get_close_matches(word, possibilities, n=1, cutoff=0.6)
    return matches[0] if matches else None

def select_topic(query: str) -> str | None:
    """Figures out which programming language the user is asking about based on their text."""
    q = query.lower()
    if "python" in q: return "python"
    if any(js in q for js in ["javascript", "js", "react", "node"]): return "javascript"
    if "html" in q: return "html"
    if "css" in q: return "css"
    return None

# ------------------------------------------------------------------------------
# PDF Indexing & Database Management
# ------------------------------------------------------------------------------
def should_reindex():
    """Checks if the PDFs on disk match the manifest to save time and API costs."""
    if not os.path.exists(MANIFEST_FILE):
        return True, "Manifest not found."

    with open(MANIFEST_FILE, 'r') as f:
        indexed_manifest = json.load(f)

    current_pdfs = []
    for topic in TOPICS:
        topic_path = os.path.join(PDF_BASE, topic)
        if os.path.exists(topic_path):
            current_pdfs.extend([os.path.join(topic, f) for f in os.listdir(topic_path) if f.lower().endswith('.pdf')])

    if sorted(indexed_manifest) != sorted(current_pdfs):
        return True, "PDFs on disk have changed."

    return False, "No changes detected."

def load_and_index(topic: str):
    """Loads PDFs, breaks them into chunks, and saves them to BOTH active databases."""
    folder_path = os.path.join(PDF_BASE, topic)
    if not os.path.exists(folder_path):
        return []

    loader = PyPDFDirectoryLoader(folder_path)
    docs = loader.load()
    if not docs:
        return []

    # Break text into chunks of 1000 characters with 200 character overlap so context isn't lost
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(docs)

    for chunk in chunks:
        chunk.metadata["topic"] = topic

    ids = [f"{topic}-{os.path.basename(c.metadata['source'])}-{i}" for i, c in enumerate(chunks)]
    
    print(f"INFO: Adding {len(chunks)} chunks to local ChromaDB for topic '{topic}'...")
    chroma_store.add_documents(chunks, ids=ids)
    
    # If Pinecone is configured, push the exact same data to the cloud
    if pinecone_store:
        print(f"INFO: Adding {len(chunks)} chunks to cloud PineconeDB for topic '{topic}'...")
        pinecone_store.add_documents(chunks, ids=ids)
        
    # Return list of indexed files for this topic so we can save it to the manifest
    return [os.path.join(topic, os.path.basename(doc.metadata['source'])) for doc in docs]

@app.on_event("startup")
async def startup_event():
    """Runs automatically when the server boots up to prepare the document databases."""
    print("Server starting up. Checking if indexing is required...")
    
    reindex, reason = should_reindex()
    if reindex:
        print(f"INFO: Re-indexing required. Reason: {reason}")
        all_indexed_files = []
        for topic in TOPICS:
            indexed_files_for_topic = load_and_index(topic)
            all_indexed_files.extend(indexed_files_for_topic)
        
        # Save a list of what we just indexed so we don't do it again next time unnecessarily
        with open(MANIFEST_FILE, 'w') as f:
            json.dump(list(set(all_indexed_files)), f, indent=2)
        print("INFO: Dual-Indexing complete.")
    else:
        print("INFO: Skipping indexing. All files are up to date.")
    
    print("INFO: Server is ready.")

# ------------------------------------------------------------------------------
# Conversational Logic and Chat Routing
# ------------------------------------------------------------------------------
greeting_responses = ["Hello! How can I help you today?", "Hi there! Ready to learn something new?", "Hey! What would you like to ask?"]
farewell_responses = ["Alright, talk to you later!", "Okay, take care!", "Bye! Have a good one.", "Catch you later!"]
ok_responses = ["Alright.", "Okay, noted.", "Got it!", "Sure thing."]

def ask_question_logic(query: str, user_id: str = "default_user") -> str:
    """The main brain of the chatbot. Handles general chat and searches through the PDFs."""
    q = query.lower().strip()

    # Quick conversational handlers so we don't waste API calls on simple greetings
    if fuzzy_match(q, ["hi", "hello", "hey"]): return random.choice(greeting_responses)
    if fuzzy_match(q, ["bye", "goodbye", "see you", "later"]): return random.choice(farewell_responses)
    if fuzzy_match(q, ["ok", "okay", "yes", "yep", "alright"]): return random.choice(ok_responses)
    
    if re.match(r"^(who are you|what is your name|your name|who made you|what are you|introduce yourself)\??$", q):
        return " Hello there! I am XpertAi, made by CodeXpert. I am available to assist with Python, JavaScript, HTML, and CSS for now. Kindly specify the language you are talking about."
    
    # Simple logic to extract and remember the user's name
    name_match = re.search(r"(?:my name is|i am|i'm) (\w+)", q)
    if name_match:
        name = name_match.group(1).capitalize()
        user_names[user_id] = name
        return f"Nice to meet you, {name}! I’ll remember your name."
    
    if "my name" in q or "who am i" in q:
        return f"Your name is {user_names.get(user_id, 'I don`t know it yet')}."
    
    # Handle current date and time requests
    if any(kw in q for kw in ["time", "date", "day", "month", "year"]):
        now = datetime.now()
        return f"The current date is {now.strftime('%A, %d %B %Y')} and time is {now.strftime('%I:%M %p')}."
    
    # Update our current topic if the user mentions a specific language
    detected_topic = select_topic(query)
    if detected_topic:
        user_topics[user_id] = detected_topic
    
    current_topic = user_topics.get(user_id)
    if not current_topic:
        return "I can help with Python, JavaScript, HTML, and CSS. Which topic are you interested in?"

    # Pulling from the LangChain document retrieval logic
    try:
        chat_history = get_session_history(user_id)

        # Retrieve documents using the active vector database (Pinecone if available, else Chroma)
        topic_retriever = active_vector_store.as_retriever(
            search_kwargs={"k": 3, "filter": {'topic': current_topic}}
        )

        # Reformulate the question to make sense on its own if it refers to past messages
        contextualize_q_prompt = ChatPromptTemplate.from_messages([
            ("system", "Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is."),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ])
        history_aware_retriever = create_history_aware_retriever(llm, topic_retriever, contextualize_q_prompt)

        # The actual prompt that instructs the AI on how to answer based on the retrieved text
        qa_prompt = ChatPromptTemplate.from_messages([
            ("system", "You are XpertAi, a helpful coding assistant created by CodeXpert. Answer concisely and clearly using markdown and code blocks if needed, based on the provided context. If you don't know the answer from the context, just say that you don't know.\n\nCONETXT:\n{context}"),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ])
        question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
        rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

        # Execute the search and generate the answer
        response = rag_chain.invoke({"input": query, "chat_history": chat_history.messages})
        answer = response.get("answer", "Sorry, I couldn't find an answer.")

        # Save this interaction to memory so it remembers it for the next question
        chat_history.add_user_message(query)
        chat_history.add_ai_message(answer)
        
        return answer.strip()
    except Exception as e:
        return f"ALERT: Error generating answer: {e}"

# ------------------------------------------------------------------------------
# Automated Code Checker Logic
# ------------------------------------------------------------------------------
def check_code_with_ai(user_code: str, language: str, problem: str):
    """Acts as a strict compiler to check user code without giving away the exact answer."""
    lang_rules = {
        "python": "Check for correct indentation and Python 3 syntax.",
        "javascript": "Check for camelCase, semi-colons, and ES6+ syntax.",
        "html": "Ensure proper tag nesting and standard structure.",
        "css": "Check for correct selector syntax and valid properties."
    }
    
    prompt = f"""
    You are a strict compiler for {language}. Specific rule: {lang_rules.get(language.lower(), "Standard syntax rules.")}
    The user is solving: "{problem}"
    
    Rules:
    1. Does it compile? Does it solve the problem?
    2. NEVER write the corrected code or give the exact solution.
    3. Output ONLY valid JSON.
    
    Format exactly like this:
    {{
      "is_correct": true or false,
      "error_type": "None", "SyntaxError", or "LogicError",
      "console_output": "The exact hint or error message."
    }}
    """

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" }, 
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_code}
            ],
            temperature=0
        )
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        return {
            "is_correct": False,
            "error_type": "ServerError",
            "console_output": f"Could not connect to AI: {str(e)}"
        }

# ------------------------------------------------------------------------------
# API Routes (Endpoints for the Mobile App to Connect To)
# ------------------------------------------------------------------------------
@app.post("/ask")
async def ask_endpoint(request: Request):
    """Endpoint for general questions and document lookups."""
    try:
        data = await request.json()
    except Exception:
        return {"error": "Invalid JSON."}
    query = data.get("query") or data.get("question") or data.get("q")
    user_id = data.get("user_id") or "default_user"
    if not query:
        return {"error": "Empty query."}
    answer = ask_question_logic(query, user_id)
    return {"answer": answer}
    
@app.post("/clear_history")
async def clear_history_endpoint(request: Request):
    """Endpoint to wipe a user's current chat memory if they want to start fresh."""
    try:
        data = await request.json()
        user_id = data.get("user_id") or "default_user"
        if user_id in user_memory: del user_memory[user_id]
        if user_id in user_topics: del user_topics[user_id]
        return {"status": f"History for {user_id} cleared."}
    except Exception:
        return {"error": "Invalid JSON."}

@app.post("/api/submit-code", response_model=CodeResponse)
async def submit_code_endpoint(request: CodeRequest):
    """Endpoint that receives code from the mobile app and passes it to the AI checker."""
    ai_result = check_code_with_ai(request.code, request.language, request.problem)
    
    # Safely handle None/null values from OpenAI to prevent server crashes
    error_type = ai_result.get("error_type")
    console_output = ai_result.get("console_output")
    
    return CodeResponse(
        is_correct=ai_result.get("is_correct", False),
        error_type=str(error_type) if error_type is not None else "None",
        console_output=str(console_output) if console_output is not None else "Evaluation complete."
    )

# ------------------------------------------------------------------------------
# Local Network Setup & Server Run
# ------------------------------------------------------------------------------
def get_local_ip():
    """Finds your computer's local IP address so your phone can connect to it over Wi-Fi."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip

if __name__ == "__main__":
    ip = get_local_ip()
    print(f"INFO: Server will run at http://{ip}:8000")
    print("INFO: Use this IP on your mobile app (Android emulator uses 10.0.2.2).")
    uvicorn.run(app, host="0.0.0.0", port=8000)