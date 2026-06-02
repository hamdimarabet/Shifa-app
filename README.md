# Shifa App

A React Native wellness app built with Expo.

## Prerequisites
- Node.js (v18 or higher)
- Expo CLI
- Expo Go app on your phone

## Setup

### 1. Clone the repo
git clone https://github.com/sourour77/ShifaApp.git
cd ShifaApp

### 2. Install dependencies
npm install

### 3. Create .env file
Create a `.env` file in the root folder with these values:
EXPO_PUBLIC_GROQ_API_KEY=your_groq_key
EXPO_PUBLIC_API_URL=https://web-production-b41ec.up.railway.app
EXPO_PUBLIC_OPENAI_KEY=your_openai_key

### 4. Run the app
npx expo start

### 5. Scan QR code
Download Expo Go on your phone and scan the QR code.

## Tech Stack
- React Native + Expo
- Supabase (database + auth)
- FastAPI backend (deployed on Railway)
- OpenAI GPT-4o (meal scanner)
- Groq Llama (backup AI)
