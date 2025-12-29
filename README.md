🚦 TRAFIQ.AI – Smart Traffic Risk Intelligence Platform

TRAFIQ.AI is an AI-powered traffic intelligence platform designed to predict traffic risks, analyze accident causes, and support proactive road safety decisions. The system combines live/simulated traffic feeds, accident video analysis, and data-driven insights while maintaining an ethical, human-in-the-loop approach.

🎨 Frontend

The frontend is built using React.js to create a fast, responsive, and interactive dashboard.
It enables smooth visualization of live traffic feeds, uploaded accident videos, analytics charts, alerts, and insights.
For visual analytics such as trends and statistics, Chart.js is used, while Google Maps API is integrated to display risk zones and user location.

⚙️ Backend

The backend is developed using Python and FastAPI.
FastAPI handles video uploads, live feed requests, and AI processing efficiently through REST APIs.
It also manages communication between the AI modules, database, and frontend dashboard.

🤖 AI & Computer Vision

AI-based analysis is implemented using YOLO for car detection and OpenCV for video frame processing.
YOLO is configured to detect only cars accurately, while OpenCV is used to read video streams, process frames, and draw stable bounding boxes.
On top of detection, rule-based logic is applied to analyze risky driving behavior and identify possible accident causes.

📹 Live Feed & Video Processing

Live and simulated traffic feeds are handled using RTSP streams.
These streams are processed using OpenCV and FFmpeg, allowing recorded traffic footage to behave like real-time camera feeds for demonstration and analysis purposes.

🧠 Accident Video Analysis

When a user uploads an accident video, the backend processes it frame by frame.
Key frames are extracted, vehicles are detected and tracked, and driving patterns are analyzed.
Based on this analysis, the system identifies likely causes such as overspeeding, sudden lane changes, or signal violations, and provides prevention insights.

🗄️ Database

Supabase is used as the primary database solution.
It stores structured data such as locations, risk scores, and user inputs, as well as detection logs, AI analysis results, and event timelines in a secure and scalable manner.

☁️ Deployment

The application is deployed using Vercel, enabling fast, scalable, and reliable web deployment.
The architecture is designed to be easily extendable for future cloud or container-based deployments.

⭐ Vision

We don’t analyze accidents — we predict and prevent them using ethical AI.
