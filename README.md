# HealthPredict AI 🩺🧠

HealthPredict AI is a comprehensive healthcare disease prediction application that integrates clinical risk scores, knowledge graph reasoning, and a powerful AI physician to provide intelligent and personalized health guidance. 

The application utilizes a modern tech stack with a React/Vite frontend and an Express/MongoDB backend.

## 🌟 Features

- **Personalized Health Profiles**: Secure user authentication (including Google Sign-In) to manage patient data securely.
- **Clinical Risk Scoring**: Framingham-style cardiovascular risk assessments with transparent scoring mechanisms.
- **Knowledge Graph Reasoning**: Connects symptoms, diseases, and patient history dynamically to provide accurate context.
- **Dr. Ada (AI Specialist)**: A conversational AI assistant grounded in your specific health profile, powered by advanced LLMs via Groq.
- **Health Recommendations**: Receive personalized recommendations tailored to your profile and historical data.

## 🛠️ Tech Stack

### Frontend
- **React 18** with **Vite** for rapid development and optimized builds
- **TailwindCSS** for responsive and beautiful UI styling
- **@react-oauth/google** for secure Google Sign-In

### Backend
- **Node.js** with **Express**
- **MongoDB** via **Mongoose** for robust data modeling
- **Groq SDK** / **Google Auth Library** for AI interactions and authentication
- **Helmet** & **CORS** for secure cross-origin resource sharing

---

## 🚀 Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI)

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repository-url>
   cd DiseaseKG-main
   ```

2. **Install Backend Dependencies**:
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd client
   npm install
   cd ..
   ```

### ⚙️ Environment Variables

Create a `.env` file in the **root** directory and copy the contents from `.env.example`. Adjust the values as needed:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/healthcare_prediction
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile  # Optional
JWT_SECRET=your_super_secret_jwt_key
CLIENT_ORIGIN=http://localhost:5173
```

Create a `.env` file in the **`client`** directory for your frontend variables:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 🏃 Running the App Locally

You can run both the frontend and backend simultaneously using the `concurrently` package.

From the root directory, run:
```bash
npm run dev:all
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

*Alternatively, you can run them separately:*
- Backend: `npm run dev`
- Frontend: `npm run dev:client`

---

## 🌍 Deployment (Render)

This application is configured to be easily deployed as a single Web Service on platforms like **Render**.

1. Connect your GitHub repository to Render.
2. Select the **Root Directory**.
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`
5. Ensure you add all the necessary Environment Variables (from your `.env` files) directly in the Render dashboard environment configuration.
