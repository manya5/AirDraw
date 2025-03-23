import cv2
import numpy as np
import mediapipe as mp
import speech_recognition as sr
import threading

# Initialize OpenCV and Mediapipe
cap = cv2.VideoCapture(0)
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands()

canvas = np.zeros((720, 1280, 3), dtype=np.uint8)  # Create a blank canvas
color = (255, 255, 255)  # Default drawing color
brush_size = 5  # Brush thickness
recognizer = sr.Recognizer()

# Define a color palette
color_palette = {
    "red": (0, 0, 255),
    "blue": (255, 0, 0),
    "green": (0, 255, 0),
    "yellow": (0, 255, 255),
    "purple": (128, 0, 128),
    "orange": (0, 165, 255),
    "white": (255, 255, 255),
    "black": (0, 0, 0)
}

def get_voice_command():
    with sr.Microphone() as source:
        print("Listening for command...")
        try:
            audio = recognizer.listen(source, timeout=3)
            command = recognizer.recognize_google(audio).lower()
            print(f"Command received: {command}")
            return command
        except sr.UnknownValueError:
            print("Could not understand the command.")
        except sr.RequestError:
            print("Could not request results; check network connection.")
        return None

def listen_for_commands():
    global canvas, color
    while True:
        command = get_voice_command()
        if command:
            if 'clear' in command:
                canvas = np.zeros((720, 1280, 3), dtype=np.uint8)
                print("Canvas cleared.")
            elif command in color_palette:
                color = color_palette[command]
                print(f"Color changed to {command}.")

# Run voice command listener in a separate thread
threading.Thread(target=listen_for_commands, daemon=True).start()

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("Camera not detected!")
        break

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb_frame)

    # Draw the color selection panel
    panel_x, panel_y, panel_size = 20, 20, 50  # Position and size of color buttons
    for i, (color_name, color_value) in enumerate(color_palette.items()):
        cv2.rectangle(frame, (panel_x, panel_y + i * 60), (panel_x + panel_size, panel_y + (i + 1) * 60), color_value, -1)
        cv2.putText(frame, color_name, (panel_x + 70, panel_y + i * 60 + 40), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            x = int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].x * w)
            y = int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].y * h)

            # Check if the finger is selecting a color
            for i, (color_name, color_value) in enumerate(color_palette.items()):
                if panel_x <= x <= panel_x + panel_size and panel_y + i * 60 <= y <= panel_y + (i + 1) * 60:
                    color = color_value
                    print(f"Selected color: {color_name}")

            # Draw on the canvas
            if 0 <= x < w and 0 <= y < h:
                cv2.circle(canvas, (x, y), brush_size, color, -1)

    blended_frame = cv2.addWeighted(frame, 0.7, canvas, 0.3, 0)
    cv2.imshow('AirCanvas', blended_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()