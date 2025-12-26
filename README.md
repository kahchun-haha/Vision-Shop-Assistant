VISION SHOP ASSISTANT
AI-POWERED SHOPPING ASSISTANT FOR THE VISUALLY IMPAIRED
======================================================

OVERVIEW
--------
This is a full-stack AI application designed to assist visually impaired users with independent shopping.

Frontend:
- React + TypeScript (Mobile Interface)

Backend:
- Python + Flask + YOLOv8 (Computer Vision)

The system detects grocery items in real-time via the camera, announces them using Text-to-Speech,
and calculates the total cost for the user.


PREREQUISITES
-------------
- Node.js (v18 or higher)
- Python (v3.9 or higher)
- A Webcam (if on laptop) OR WiFi connection (if testing on mobile)


INSTALLATION INSTRUCTIONS
-------------------------

STEP 1: INSTALL BACKEND DEPENDENCIES (PYTHON)
---------------------------------------------
Open a terminal in the project folder and run:

pip install flask flask-cors ultralytics pillow pyopenssl


STEP 2: INSTALL FRONTEND DEPENDENCIES (REACT)
---------------------------------------------
Open a new terminal in the project folder and run:

npm install


IMPORTANT: NETWORK CONFIGURATION (CHECK THIS FIRST!)
----------------------------------------------------
If you are running this on a new WiFi network, your IP address might have changed.
You must update the code to match your new IP.

1. Find your current IP address:
   Open a terminal and run:

   ipconfig

   Look for the "IPv4 Address" (example: 192.168.1.111)

2. Update the Frontend Code:
   Open the file:

   src/services/yoloService.ts

   Find the fetch URL and replace the IP with your new one.

   Example:

   const response = await fetch('https://192.168.1.111:5000/detect', { ... });


HOW TO RUN THE APP
-----------------
You must run TWO separate terminals at the same time.


TERMINAL 1: THE BRAIN (BACKEND)
-------------------------------
Run this command to start the Object Detection Server:

python server.py

Wait until you see:
"Running on https://0.0.0.0:5000"


TERMINAL 2: THE BODY (FRONTEND)
-------------------------------
Run this command to start the User Interface:

npm run dev

You will see a Local URL such as:
https://localhost:3000


HOW TO TEST ON MOBILE (WIFI)
----------------------------
1. Ensure your Phone and Laptop are on the SAME WiFi network.

2. Look at the Terminal 2 output to find your Network IP.
   Example:
   https://192.168.1.111:3000

3. Open that URL on your phone's browser (Chrome or Safari).

4. Accept the "Unsafe Certificate" warning:
   Advanced -> Proceed

5. Allow Camera permissions when prompted.


TROUBLESHOOTING
---------------
Camera Access Denied:
- Ensure you are using the https:// link, not http://
- Browsers block camera access on insecure HTTP connections.

Nothing Detected:
- Check Terminal 1.
- If it is frozen, your phone may have lost connection.
- Restart the server and verify the IP address in yoloService.ts.

Module Not Found:
- Run npm install or pip install again to ensure all dependencies are installed.


FILE STRUCTURE
--------------
server.py
- Python Flask server that runs YOLO

model.pt
- Custom trained YOLOv8 model file

products.json
- Database of item names and prices

src/App.tsx
- Main React application logic

src/services/
- yoloService.ts (Vision)
- ttsService.ts (Voice)
