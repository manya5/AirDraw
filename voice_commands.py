import speech_recognition as sr

recognizer = sr.Recognizer()

def get_voice_command():
    with sr.Microphone() as source:
        print("Listening for command...")
        audio = recognizer.listen(source)
        try:
            command = recognizer.recognize_google(audio).lower()
            print(f"Command received: {command}")
            return command
        except sr.UnknownValueError:
            print("Could not understand the command.")
            return None
        except sr.RequestError:
            print("Could not request results; check your network connection.")
            return None
        
# Test the function
# command = get_voice_command()
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
                cv2.circle(canvas, (x, y), 5, (255, 255, 255), -1)

    blended_frame = cv2.addWeighted(frame, 0.7, canvas, 0.3, 0)
    cv2.imshow('AirCanvas', blended_frame)

    # Listen for voice commands
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

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break