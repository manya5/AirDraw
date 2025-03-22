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

canvas = np.zeros((720, 1280, 3), dtype=np.uint8)
color = (255, 255, 255)  # Default color
recognizer = sr.Recognizer()

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
            elif 'red' in command:
                color = (0, 0, 255)
                print("Color changed to red.")
            elif 'blue' in command:
                color = (255, 0, 0)
                print("Color changed to blue.")
            elif 'green' in command:
                color = (0, 255, 0)
                print("Color changed to green.")

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

    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            x = int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].x * w)
            y = int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].y * h)
            if 0 <= x < w and 0 <= y < h:
                cv2.circle(canvas, (x, y), 5, color, -1)

    blended_frame = cv2.addWeighted(frame, 0.7, canvas, 0.3, 0)
    cv2.imshow('AirCanvas', blended_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
hands.close()