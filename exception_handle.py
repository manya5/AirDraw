try:
    command = recognizer.recognize_google(audio).lower()
    print(f"You said: {command}")
except sr.UnknownValueError:
    print("Google Speech Recognition could not understand audio")
except sr.RequestError as e:
    print(f"Could not request results; {e}")
except Exception as e:
    print(f"An error occurred: {e}")