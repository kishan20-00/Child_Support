from flask import Flask, request, jsonify
from groq import Groq
import os
from dotenv import load_dotenv

app = Flask(__name__)

# Load environment variables from .env file
load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        # Check if the request contains a file
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']

        # Save the file temporarily
        filename = os.path.join("uploads", file.filename)
        os.makedirs("uploads", exist_ok=True)
        file.save(filename)

        # Transcribe the audio file using Groq
        with open(filename, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=(filename, audio_file.read()),  # Required audio file
                model="whisper-large-v3-turbo",  # Required model to use for transcription
                prompt="Specify context or spelling",  # Optional
                language="en",  # Optional
                response_format="json",  # Optional
                temperature=0.0  # Optional
            )

        # Delete the temporary file
        os.remove(filename)

        # Return the transcription
        return jsonify({'transcription': transcription.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5008)