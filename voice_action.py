if 'clear' in command:
    canvas = np.zeros((720, 1280, 3), dtype=np.uint8)
elif 'red' in command:
    color = (0, 0, 255)
