import cv2

cap = cv2.VideoCapture(0)  # Try changing 0 to 1 if external webcam
while True:
    ret, frame = cap.read()
    if not ret:
        print("Camera not detected!")
        break
    cv2.imshow('Camera Test', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
