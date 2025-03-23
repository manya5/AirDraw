from flask import Flask, request, jsonify
import numpy as np
import cv2
import base64


app = Flask(__name__)

# Enable CORS if needed
from flask_cors import CORS
CORS(app)

# Initialize a blank canvas
canvas = np.zeros((480, 640, 3), dtype=np.uint8)

@app.route('/process_frame', methods=['POST'])
def process_frame():
    """Receive frame data, process it, and return a modified canvas"""
    try:
        data = request.json
        frame_data = np.array(data['frame'], dtype=np.uint8).reshape((480, 640, 4))  # Reshape into (H, W, 4)

        # Convert from RGBA to RGB
        frame_rgb = frame_data[:, :, :3]

        # Apply simple image processing (optional)
        gray = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2GRAY)
        processed_frame = cv2.applyColorMap(gray, cv2.COLORMAP_JET)

        # Convert back to base64 image
        _, buffer = cv2.imencode('.png', processed_frame)
        encoded_image = base64.b64encode(buffer).decode('utf-8')

        return jsonify({'canvas': encoded_image})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/voice_command', methods=['POST'])
def voice_command():
    """Handle voice commands from the frontend"""
    data = request.json
    command = data.get("command", "").lower()

    global canvas

    if command == 'clear':
        canvas = np.zeros((480, 640, 3), dtype=np.uint8)  # Reset canvas
        return jsonify({"status": "Canvas cleared"})

    elif command in ['red', 'blue', 'green']:
        colors = {
            'red': (0, 0, 255),
            'blue': (255, 0, 0),
            'green': (0, 255, 0)
        }
        canvas[:] = colors[command]  # Change canvas color
        return jsonify({"status": f"Color changed to {command}"})

    elif command == 'save':
        cv2.imwrite("saved_canvas.png", canvas)
        return jsonify({"status": "Canvas saved as saved_canvas.png"})

    return jsonify({"status": "Unknown command"})

if __name__ == '__main__':
    app.run(debug=True)
