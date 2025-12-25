# Vision Shop Assistant
### AI-Powered Shopping Assistant for the Visually Impaired

## Overview
This is a full-stack AI application designed to assist visually impaired users with independent shopping.
* **Frontend:** React + TypeScript (Mobile Interface)
* **Backend:** Python + Flask + YOLOv8 (Computer Vision)

The system detects grocery items in real-time via the camera, announces them using Text-to-Speech, and calculates the total cost for the user.

---

## Prerequisites
* **Node.js** (v18 or higher)
* **Python** (v3.9 or higher)
* A **Webcam** (if on laptop) or **WiFi connection** (if testing on mobile)

---

## Installation Instructions

### Step 1: Install Backend Dependencies (Python)
Open a terminal in the project folder and run:
pip install flask flask-cors ultralytics pillow pyopenssl

### Step 2: Install Frontend Dependencies (React)
Open a new terminal in the project folder and run:
npm install

---

## How to Run the App
You must run TWO separate terminals at the same time.

### Terminal 1: The Brain (Backend)
Run this command to start the Object Detection Server:
python server.py
(Wait until you see: "Running on https://0.0.0.0:5000")

### Terminal 2: The Body (Frontend)
Run this command to start the User Interface:
npm run dev
(You will see a Local URL like: https://localhost:3000)

---

## How to Test on Mobile (WiFi)
1.  Ensure your Phone and Laptop are on the SAME WiFi network.
2.  Look at the "Terminal 2" output to find your Network IP (e.g., https://192.168.1.111:3000).
3.  Open that URL on your phone's browser (Chrome or Safari).
4.  Accept the "Unsafe Certificate" warning (click Advanced -> Proceed).
5.  Allow Camera permissions when asked.

---

## Troubleshooting
* **"Camera Access Denied":**
    Ensure you are using the https:// link, not http://. Browsers block cameras on insecure HTTP connections.

* **"Nothing Detected":**
    Check Terminal 1. If it is frozen, your phone might have lost connection to the server. Restart the server and check your IP address in src/services/yoloService.ts.

* **"Module Not Found":**
    Run npm install or pip install again to ensure all libraries are downloaded.

---

## File Structure
* server.py: The Python Flask server that runs YOLO.
* model.pt: The custom trained YOLOv8 model file.
* products.json: Database of item names and prices.
* src/App.tsx: Main React application logic.
* src/services/: Contains yoloService.ts (Vision) and ttsService.ts (Voice).
