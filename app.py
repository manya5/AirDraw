from flask import Flask, render_template, request, jsonify
import cv2
import mediapipe as mp
import numpy as np
from AirDraw.voice_commands import process_voice_command
from pymongo import MongoClient

app = Flask(__name__ , template_folder='templates/index.html')

# Serve the front-end
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)


# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['aircanvas_db']
drawings_collection = db['drawings']

# MediaPipe hands setup
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7)
mp_drawing = mp.solutions.drawing_utils

# Global variables for drawing
canvas = np.zeros((480, 640, 3), dtype=np.uint8)  # Blank canvas
prev_x, prev_y = None, None

@app.route('/process_frame', methods=['POST'])
def process_frame():
    global canvas, prev_x, prev_y

    # Get frame data from front-end
    frame_data = request.json['frame']
    frame = np.array(frame_data, dtype=np.uint8)

    # Process frame with MediaPipe
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(frame_rgb)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # Get index finger tip coordinates
            index_finger = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
            x, y = int(index_finger.x * frame.shape[1]), int(index_finger.y * frame.shape[0])

            # Draw on canvas
            if prev_x is not None and prev_y is not None:
                cv2.line(canvas, (prev_x, prev_y), (x, y), (0, 255, 0), 5)
            prev_x, prev_y = x, y

    # Return canvas as response
    _, buffer = cv2.imencode('.png', canvas)
    canvas_base64 = buffer.tobytes().hex()
    return jsonify({'canvas': canvas_base64})

@app.route('/voice_command', methods=['POST'])
def handle_voice_command():
    audio_data = request.files['audio'].read()
    command = process_voice_command(audio_data)

    # Handle commands (e.g., clear canvas, change color)
    if command == "clear":
        global canvas
        canvas = np.zeros((480, 640, 3), dtype=np.uint8)
        return jsonify({'status': 'Canvas cleared'})
    elif command == "save":
        # Save drawing to MongoDB
        drawing_data = {'image': canvas.tolist()}
        drawings_collection.insert_one(drawing_data)
        return jsonify({'status': 'Drawing saved'})
    else:
        return jsonify({'status': 'Unknown command'})

