# 🎯 CyberX – Deepfake Video Detection Analysis System

## 📌 Overview
CyberX is an AI-powered web-based system designed to detect deepfake videos by analyzing both visual and temporal features using computer vision and deep learning techniques. The system aims to support cybersecurity and prevent misuse of manipulated media by providing early detection of fake content.

This project was developed in iterative sprints using Agile methodology, where Sprint 1 focused on system foundations and Sprint 2 implemented core AI detection and data management features.

---

## 🧠 Key Features

### 🔐 Authentication System
- User Registration (name, email, password)
- Secure Login System
- Session Management

### 🎥 Video Upload & Processing
- Upload videos (MP4, AVI, MOV)
- Drag-and-drop or file selection
- File validation (type + size)

### 🤖 AI-Based Deepfake Detection
- Frame extraction from video
- Preprocessing of frames
- Deep learning model for classification
- Output: Real or Fake

### 📊 Result Visualization
- Detection result (Real/Fake)
- Confidence score (percentage)
- Color-coded UI (Green = Real, Red = Fake)

### 📂 Analysis History
- View past analyzed videos
- Store results per user
- Persistent data across sessions

### ⏳ Progress Loader
- Real-time processing indicator
- Status messages during analysis

### 🗑️ Data Management
- Delete uploaded videos
- Confirmation prompts
- Immediate UI updates

### 📄 Report Generation
- Downloadable PDF report
- Includes:
  - Video name
  - Date
  - Result
  - Confidence score

---

## 🏗️ System Architecture

CyberX follows a **3-Tier Architecture**:

1. **Presentation Layer (Frontend)**
   - User Interface
   - Upload, Display, Interaction

2. **Business Logic Layer (Backend)**
   - API handling
   - AI model processing
   - File handling

3. **Data Layer (Database)**
   - User data
   - Video storage
   - Analysis results

---

## 🔄 System Workflow

1. User registers/logs in
2. User uploads video
3. File validation is performed
4. Backend receives file
5. Frames are extracted
6. AI model processes video
7. Result generated (Real/Fake)
8. Confidence score calculated
9. Result stored in database
10. User can:
   - View history
   - Delete video
   - Download report

---

## 🧩 Tech Stack

### 💻 Frontend
- React / Next.js
- TypeScript
- CSS

### ⚙️ Backend
- Node.js / Express
- API Routes

### 🤖 AI / ML
- Python
- Deep Learning Model (CNN / LSTM based)
- OpenCV (for frame extraction)

### 🗄️ Database
- (Specify: MongoDB / Firebase / SQL if used)

---

## 📊 Diagrams Included

- Architecture Diagram
- Component Diagram
- Data Flow Diagram (DFD Level 0, 1, 2)
- Sequence Diagrams
- Activity Diagrams
- Class Diagram
- Use Case Diagram

---

## 🧑‍🤝‍🧑 Team Contributions

| Member | Role | Responsibilities |
|------|------|----------------|
| Hareem | Backend + AI | AI model integration, backend logic |
| Ayesha | Frontend | UI, result display, loader |
| Rida | Full Stack | History, delete feature, integration |

---

## 📈 Agile Development

- Methodology: Scrum
- Sprint 1: Authentication + Upload System
- Sprint 2: AI Detection + Data Management
- Tools: Trello (task tracking)

---

## ⚡ Performance & Non-Functional Requirements

- Fast processing (under ~60 seconds)
- User-friendly interface
- Scalable architecture
- Secure data handling
- Cross-browser compatibility
- Reliable and fault-tolerant system

---

## 🔐 Security Features

- Input validation
- File type restrictions
- File size limits
- Secure user authentication
- Protected data access

---

## 🚀 Future Improvements

- Real-time deepfake detection
- Audio + image-based detection
- Improved AI accuracy
- Cloud deployment
- Mobile support

---

## 📂 Project Structure
CyberX/
│── app.py
│── predict.py
│── train_model.py
│── route.ts
│── auth-context.tsx
│── page.tsx
│── layout.tsx
│── history.ts
│── globals.css
│── README.md



## ▶️ How to Run

### 1. Clone Repository
```bash
git clone https://github.com/your-repo-link
cd CyberX

### 2. Install Dependencies
npm install
pip install -r requirements.txt

### 3. Run Backend
python app.py

### 4. Run Frontend
npm run dev

