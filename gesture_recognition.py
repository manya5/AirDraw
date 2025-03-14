import numpy as np

canvas = np.zeros((720, 1280, 3), dtype=np.uint8)

while True:
    # [Capture and process frame as before]
    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            # Extract coordinates of the index fingertip
            x = int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].x * frame.shape[1])
            y = int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].y * frame.shape[0])
            cv2.circle(canvas, (x, y), 5, (255, 255, 255), -1)
    frame = cv2.add(frame, canvas)
    cv2.imshow('AirCanvas', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
