// Mobile menu toggle
document.querySelector('.menu-toggle').addEventListener('click', function () {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Handle explore features button
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling for the explore features button
    document.getElementById('explore-features').addEventListener('click', function(e) {
        e.preventDefault();
        const voiceFeatures = document.getElementById('voice-features');
        voiceFeatures.scrollIntoView({ behavior: 'smooth' });
    });

    // Add animation for workflow diagram nodes
    const nodes = document.querySelectorAll('.node');
    nodes.forEach(node => {
        node.addEventListener('mouseenter', function () {
            const transform = this.style.transform || window.getComputedStyle(this).transform;
            if (transform.includes('-50%, -50%')) {
                this.style.transform = transform.replace('-50%, -50%', '-50%, -60%');
            }
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            this.style.transition = 'all 0.3s ease';
        });

        node.addEventListener('mouseleave', function () {
            const transform = this.style.transform || window.getComputedStyle(this).transform;
            if (transform.includes('-50%, -60%')) {
                this.style.transform = transform.replace('-50%, -60%', '-50%, -50%');
            }
            this.style.boxShadow = 'none';
        });
    });
});

// Handle navigation button clicks for voice sections
document.querySelectorAll('.nav-btn-voice').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.nav-btn-voice.active')?.classList.remove('active');
        document.querySelector('.section.active')?.classList.remove('active');

        btn.classList.add('active');
        const sectionId = btn.getAttribute('data-section');
        localStorage.setItem('activeSection', sectionId); // Store selected section

        const section = document.querySelector(`.section[data-section="${sectionId}"]`);
        if (section) {
            section.classList.add('active');
        }
    });
});

// On page load, restore last active section
document.addEventListener('DOMContentLoaded', () => {
    const savedSection = localStorage.getItem('activeSection') || 'text-to-speech';
    document.querySelector(`.nav-btn-voice[data-section="${savedSection}"]`)?.click();
});

// Text 2 Speech
document.getElementById("tts-male").addEventListener("click", function () {
    document.getElementById("tts-male").classList.add("active");
    document.getElementById("tts-female").classList.remove("active");
});

document.getElementById("tts-female").addEventListener("click", function () {
    document.getElementById("tts-female").classList.add("active");
    document.getElementById("tts-male").classList.remove("active");
});

document.getElementById("tts-submit").addEventListener("click", async function () {
    const text = document.getElementById("tts-input").value;
    const gender = document.querySelector(".voice-btn.active").id === "tts-male" ? "male" : "female";

    const formData = new FormData();
    formData.append("text", text);
    formData.append("gender", gender);

    try {
        const response = await fetch("http://localhost:8000/generate", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Server error. Please check the backend.");
        }

        const data = await response.json();
        if (data.success) {
            document.getElementById("tts-status").innerText = data.message;
            document.getElementById("tts-download").disabled = false;
            document.getElementById("tts-play").disabled = false;
        } else {
            throw new Error("Failed to generate speech.");
        }
    } catch (error) {
        document.getElementById("tts-status").innerText = "Error: " + error.message;
    }
});

document.getElementById("tts-play").addEventListener("click", async function () {
    const audio = document.getElementById("tts-audio");
    const audioUrl = `http://localhost:8000/download?t=${new Date().getTime()}`;

    try {
        const response = await fetch(audioUrl);
        if (!response.ok) {
            throw new Error("Audio file not found.");
        }

        audio.src = audioUrl;
        audio.style.display = "block";
        audio.load();
        audio.play();
    } catch (error) {
        document.getElementById("tts-status").innerText = "Error: " + error.message;
    }
});

document.getElementById("tts-download").addEventListener("click", async function () {
    const downloadUrl = `http://localhost:8000/download?t=${new Date().getTime()}`;

    try {
        const response = await fetch(downloadUrl);
        if (!response.ok) {
            throw new Error("Download file not available.");
        }

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "speech.mp3";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        document.getElementById("tts-status").innerText = "Error: " + error.message;
    }
});

// Voice changer
let mediaRecorder;
let audioChunks = [];

document.getElementById("record-voice").addEventListener("click", async function () {
    try {
        let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.start();
        document.getElementById("recording-status").innerText = "Recording...";
        document.getElementById("record-voice").classList.add("hidden");
        document.getElementById("stop-recording").classList.remove("hidden");

        audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            let audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            let audioUrl = URL.createObjectURL(audioBlob);
            let recordedAudio = document.getElementById("recorded-audio");
            recordedAudio.src = audioUrl;
            recordedAudio.classList.remove("hidden");
            document.getElementById("effect-controls").classList.remove("hidden"); // Show the dropdown
            document.getElementById("apply-voice").classList.remove("hidden");
        };
    } catch (err) {
        document.getElementById("recording-status").innerText = "Error accessing microphone: " + err.message;
        console.error("Error accessing microphone:", err);
    }
});

document.getElementById("stop-recording").addEventListener("click", function () {
    mediaRecorder.stop();
    document.getElementById("recording-status").innerText = "Recording stopped.";
    document.getElementById("record-voice").classList.remove("hidden");
    document.getElementById("stop-recording").classList.add("hidden");
});

document.getElementById("apply-voice").addEventListener("click", async function () {
    let effect = document.getElementById("voice-effect").value;
    let recordedAudio = document.getElementById("recorded-audio");

    let audioBlob = await fetch(recordedAudio.src).then(res => res.blob());
    let formData = new FormData();
    formData.append("audio", audioBlob, "audio.wav");
    formData.append("effect", effect);

    try {
        let response = await fetch("http://127.0.0.1:8000/process", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            let processedBlob = await response.blob();
            let processedUrl = URL.createObjectURL(processedBlob);

            // Play transformed voice
            let transformedAudio = document.getElementById("voice-changer-audio");
            transformedAudio.src = processedUrl;
            transformedAudio.classList.remove("hidden");

            // Ensure the audio is loaded before playing
            transformedAudio.addEventListener('loadedmetadata', () => {
                transformedAudio.play().catch(err => {
                    console.error("Error playing transformed audio:", err);
                    document.getElementById("recording-status").innerText = "Error playing audio: " + err.message;
                });
            });

            // Show download button
            let downloadBtn = document.getElementById("download-voice");
            downloadBtn.classList.remove("hidden");
            downloadBtn.dataset.url = processedUrl; // Store the URL for downloading
        } else {
            document.getElementById("recording-status").innerText = "Error processing audio.";
            console.error("Error processing audio:", response.statusText);
        }
    } catch (err) {
        document.getElementById("recording-status").innerText = "Error: " + err.message;
        console.error("Error applying effect:", err);
    }
});

// Handle download without refreshing the page
document.getElementById("download-voice").addEventListener("click", function () {
    const url = this.dataset.url;
    const effect = document.getElementById("voice-effect").value;
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `transformed-voice-${effect}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Text to SFX
document.addEventListener("DOMContentLoaded", () => {
    const sfxInput = document.getElementById("sfx-input");
    const sfxSubmit = document.getElementById("sfx-submit");
    const sfxAudio = document.getElementById("sfx-audio");

    sfxSubmit.addEventListener("click", async () => {
        const query = sfxInput.value.trim();
        if (!query) {
            alert("Please enter text for SFX generation.");
            return;
        }

        try {
            sfxSubmit.disabled = true;
            sfxSubmit.textContent = "Generating...";

            const response = await fetch("http://127.0.0.1:8000/generate_sfx", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: query }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to generate SFX");
            }

            const data = await response.json();
            const audioUrl = `http://127.0.0.1:8000${data.url}?v=${Date.now()}`;

            sfxAudio.src = audioUrl;

            // Wait for audio to be ready before playing
            sfxAudio.addEventListener("canplaythrough", () => {
                sfxAudio.play().catch(err => {
                    console.warn("Playback failed:", err);
                });
            }, { once: true });

            sfxAudio.classList.remove("hidden");
        } catch (error) {
            console.error("Error:", error);
            alert(`Error: ${error.message}`);
        } finally {
            sfxSubmit.disabled = false;
            sfxSubmit.textContent = "Generate SFX";
        }
    });
});

// Speech To Text
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-recording');
    const output = document.getElementById('stt-output');
    let mediaRecorder;
    let audioChunks = [];

    // Check for browser support
    if (!navigator.mediaDevices || !window.MediaRecorder) {
        output.textContent = 'MediaRecorder not supported in this browser.';
        startButton.disabled = true;
        return;
    }

    startButton.addEventListener('click', async () => {
        if (startButton.textContent === 'Start Recording') {
            try {
                // Request microphone access
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    audioChunks = []; // Reset chunks

                    // Send audio to backend
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'recording.wav');

                    output.textContent = 'Transcribing...';
                    try {
                        const response = await fetch('http://localhost:8000/transcribe', {
                            method: 'POST',
                            body: formData,
                        });

                        if (!response.ok) {
                            throw new Error('Transcription failed');
                        }

                        const result = await response.json();
                        output.textContent = `${result.transcription}`;
                        
                    } catch (error) {
                        output.textContent = `Error: ${error.message}`;
                    }

                    // Stop the stream
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                startButton.textContent = 'Stop Recording';
            } catch (error) {
                output.textContent = `Error accessing microphone: ${error.message}`;
            }
        } else {
            mediaRecorder.stop();
            startButton.textContent = 'Start Recording';
        }
    });
});

