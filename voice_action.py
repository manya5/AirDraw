import speech_recognition as sr

r = sr.Recognizer()

with sr.Microphone() as source:
    print("Speak Please")
    r.adjust_for_ambient_noise(source, duration=2)
    audio = r.record(source, duration=2)
    try:
        print("You said: {}".format(r.recognize_google(audio,language='en-USA')))
    except:
        print("Couldn't hear you")