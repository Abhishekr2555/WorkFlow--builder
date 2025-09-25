# 🧱 Workflow Builder with AI Agent Integration

This project is a **visual workflow builder** that allows users to design, configure, and manage automation flows through an intuitive drag-and-drop interface.  
The system consists of a **React Flow–based frontend** and a **Python backend AI Agent** (using PydanticAI) that can generate workflows based on user input.

---

## Features

### 1. Node Palette (Left Sidebar)
- Sidebar lists predefined nodes:
  - **API Call**
  - **Condition**
  - **Delay**
  - **Python Code Executor**
- Nodes can be **dragged** or **clicked** to add to the canvas.

### 2. React Flow Canvas (Center)
- Displays nodes and connections.
- Supports drag-and-drop positioning and connections.
- Clicking a node opens its **config panel**.

### 3. Node Config Panel (Right Sidebar)
- Editable fields depending on node type:
  - **API Call** → URL, Method
  - **Condition** → Expression (e.g., `value > 10`)
  - **Python Code Executor** → Code (e.g., `print("Hello, World!")`)
  - **Delay** → Duration (seconds)

### 4. Import/Export
- **Export**: Download/copy workflow as JSON.
- **Import**: Load JSON to restore workflow.

### 5. Backend AI Agent (PydanticAI)
- AI agent generates workflow JSON from natural language.
- Example:  
  _"Create a workflow that calls an API, waits 5 seconds, and checks if value > 10 before running code."
  
---

## Tech Stack
**Frontend**
- React, React Flow  
- Zustand/Redux  
- TailwindCSS / ShadCN UI  

**Backend**
- FastAPI  
- PydanticAI  
---

## Use Cases
- Automation Builder (no-code flows)  
- AI-Assisted Workflow Generation  
- Integration Testing  
- Education & Training  

---

## Installation & Setup

### Frontend
cd frontend
npm install
npm run dev

### Backend
cd backend
python -m venv venv
.\venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload

### Output
<img width="1912" height="908" alt="image" src="https://github.com/user-attachments/assets/53e4ce18-d209-4b1b-9da5-5959aa31bea9" />
<img width="1901" height="897" alt="image" src="https://github.com/user-attachments/assets/6d019599-3eec-46ce-84df-54eca37a5e36" />
<img width="1917" height="902" alt="image" src="https://github.com/user-attachments/assets/b5f1a65b-723c-4d0b-bfee-e5627accba2a" />
<img width="1894" height="912" alt="image" src="https://github.com/user-attachments/assets/eb6b82ff-b621-4d2b-8de9-551d2a8a4fc0" />


