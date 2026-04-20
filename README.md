💰 DreamGullak
Smart Savings & Goal-Based Financial Web App
📌 Overview

DreamGullak is a goal-based savings web application designed to help users build disciplined financial habits. It allows users to create personalized savings goals (like travel, gadgets, or emergency funds), deposit money flexibly, and track their progress in real-time.

The platform focuses on simplicity, security, and motivation—making saving money engaging and structured.

🚀 Features
🎯 Create Savings Goals
Set custom financial goals with target amounts and deadlines
💵 Flexible Deposits
Add money anytime (manual saving system)
📊 Progress Tracking
Visual representation of savings progress
🔐 Secure Authentication
OTP-based login using Firebase Authentication
🔄 Real-Time Updates
Live data sync using Firestore
🤝 Relationship Saving System (Unique Feature)
Connect with a partner and save together
💬 Chatbot Support System
Built-in help & support chatbot for user assistance
🛠️ Tech Stack
Frontend
React.js
Next.js
HTML, CSS, JavaScript
Backend / Database
Firebase Firestore
Firebase Authentication
Tools & Concepts
Git & GitHub
REST APIs
Real-time data handling
Component-based architecture
🧠 How It Works
User signs in using OTP authentication
Creates a savings goal
Adds money towards the goal
Tracks progress visually
(Optional) Connects with a partner for shared savings
Uses chatbot for support/help
📂 Project Structure
DreamGullak/
│── app/
│   ├── dashboard/
│   ├── create-portal/
│   ├── login/
│   ├── register/
│
│── components/
│── lib/
│   ├── firebase.js
│
│── public/
│── styles/
│── README.md
⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/DreamGullak.git
cd DreamGullak
2️⃣ Install Dependencies
npm install
3️⃣ Setup Firebase
Create a project on Firebase
Enable Authentication (Phone/OTP)
Enable Firestore Database
Add your Firebase config in:
/lib/firebase.js
4️⃣ Run the Project
npm run dev

App will run on:
👉 http://localhost:3000

🔐 Environment Variables

Create a .env.local file and add:

NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
📸 Screenshots

Add your project screenshots here

🎯 Future Improvements
💳 Payment gateway integration
📈 AI-based saving suggestions
📊 Advanced analytics dashboard
🔔 Smart reminders & notifications
🌍 Multi-language support
🤝 Contributing

Contributions are welcome!
Feel free to fork this repo and submit a pull request.

📄 License

This project is licensed under the MIT License.

👨‍💻 Author

Kaushal Kishor

GitHub: https://github.com/your-username
⭐ Support

If you like this project, give it a ⭐ on GitHub!
