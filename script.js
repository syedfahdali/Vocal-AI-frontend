        // Mobile menu toggle
        document.querySelector('.menu-toggle').addEventListener('click', function () {
            const navLinks = document.querySelector('.nav-links');
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });

        // Handle "GET STARTED FREE" click to show auth modal
        document.querySelector('.cta-button').addEventListener('click', function (e) {
            e.preventDefault();
            document.getElementById('auth-modal').style.display = 'block';
        });

        // Handle auth tabs (Sign In / Sign Up)
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelector('.tab-btn.active').classList.remove('active');
                this.classList.add('active');
                document.querySelector('.tab-content.active').classList.remove('active');
                document.getElementById(this.getAttribute('data-tab')).classList.add('active');

                const modalHeader = document.querySelector('.modal h2');
                if (this.getAttribute('data-tab') === 'sign-in') {
                    modalHeader.textContent = 'Login';
                } else {
                    modalHeader.textContent = 'Sign Up';
                }
            });
        });

        // Ensure only the default tab content is visible on page load
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('sign-in').classList.add('active');
            updateUserProfile();

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

        // Form validation and submission
        const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const validatePassword = (password) => password.length >= 6;

        document.getElementById('sign-in-submit').addEventListener('click', function (e) {
            e.preventDefault();
            const username = document.getElementById('sign-in-username').value;
            const password = document.getElementById('sign-in-password').value;
            const usernameError = document.getElementById('username-error');
            const passwordError = document.getElementById('password-error');

            usernameError.classList.add('hidden');
            passwordError.classList.add('hidden');

            if (!username.trim()) {
                usernameError.textContent = 'Username/Email is required';
                usernameError.classList.remove('hidden');
                return;
            }
            if (!validatePassword(password)) {
                passwordError.textContent = 'Password must be at least 6 characters';
                passwordError.classList.remove('hidden');
                return;
            }

            this.classList.add('loading');
            setTimeout(() => {
                this.classList.remove('loading');
                alert(`Successfully signed in with ${username}`);
                localStorage.setItem('user', JSON.stringify({ username }));
                document.getElementById('auth-modal').style.display = 'none';
                updateUserProfile();
            }, 1000);
        });

        document.getElementById('sign-up-submit').addEventListener('click', function (e) {
            e.preventDefault();
            const email = document.getElementById('sign-up-email').value;
            const password = document.getElementById('sign-up-password').value;
            const name = document.getElementById('sign-up-name').value;
            const emailError = document.getElementById('email-error');
            const passwordError = document.getElementById('password-signup-error');
            const nameError = document.getElementById('name-error');

            emailError.classList.add('hidden');
            passwordError.classList.add('hidden');
            nameError.classList.add('hidden');

            if (!validateEmail(email)) {
                emailError.textContent = 'Valid email is required';
                emailError.classList.remove('hidden');
                return;
            }
            if (!validatePassword(password)) {
                passwordError.textContent = 'Password must be at least 6 characters';
                passwordError.classList.remove('hidden');
                return;
            }
            if (!name.trim()) {
                nameError.textContent = 'Name is required';
                nameError.classList.remove('hidden');
                return;
            }

            this.classList.add('loading');
            setTimeout(() => {
                this.classList.remove('loading');
                alert(`Successfully signed up with email: ${email} and name: ${name}`);
                localStorage.setItem('user', JSON.stringify({ username: email, name }));
                document.getElementById('auth-modal').style.display = 'none';
                updateUserProfile();
            }, 1000);
        });

        // Social sign-in (simulated)
        ['google-signin', 'facebook-signin', 'google-signup', 'facebook-signup'].forEach(id => {
            document.getElementById(id).addEventListener('click', function () {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                    const platform = this.id.split('-')[0];
                    alert(`Signing ${platform === 'google' || platform === 'facebook' ? 'in' : 'up'} with ${platform}...`);
                    document.getElementById('auth-modal').style.display = 'none';
                    updateUserProfile();
                }, 1000);
            });
        });

        // Update user profile
        function updateUserProfile() {
            const user = JSON.parse(localStorage.getItem('user'));
            const profile = document.getElementById('user-profile');
            if (user) {
                profile.querySelector('span').textContent = user.name || user.username;
                document.querySelector('.cta-button').style.display = 'none';
            } else {
                profile.querySelector('span').textContent = 'Guest';
                document.querySelector('.cta-button').style.display = 'inline-block';
            }
        }

        document.getElementById('logout').addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('user');
            updateUserProfile();
            alert('Logged out successfully');
        });

        // Handle navigation button clicks for voice sections
        document.querySelectorAll('.nav-btn-voice').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.nav-btn-voice.active')?.classList.remove('active');
                document.querySelector('.section.active')?.classList.remove('active');
                btn.classList.add('active');
                const sectionId = btn.getAttribute('data-section');
                const section = document.querySelector(`.section[data-section="${sectionId}"]`);
                if (section) {
                    section.classList.add('active');
                }
            });
        });

        // Initially show the "Voice Cloning" section
        document.querySelector('.nav-btn-voice[data-section="voice-cloning"]').click();

        // Audio playback for voice samples
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const audioUrl = btn.getAttribute('data-audio');
                if (audioUrl) {
                    try {
                        const response = await fetch(audioUrl);
                        const arrayBuffer = await response.arrayBuffer();
                        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                        const source = audioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(audioContext.destination);
                        source.start();
                    } catch (error) {
                        alert('Error playing audio: ' + error.message);
                    }
                } else {
                    alert('Audio file not found');
                }
            });
        });

        // Text to Speech
        document.getElementById('tts-submit').addEventListener('click', () => {
            const text = document.getElementById('tts-input').value;
            if (text.trim() === '') {
                alert('Please enter some text for Text to Speech!');
                return;
            }
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
            document.getElementById('tts-audio').classList.remove('hidden');
            document.getElementById('tts-audio').src = URL.createObjectURL(new Blob([new Uint8Array()], { type: 'audio/wav' }));
        });

        // Speech to Text (basic implementation)
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        document.getElementById('start-recording').addEventListener('click', () => {
            recognition.start();
            document.getElementById('stt-output').textContent = 'Listening...';
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('stt-output').textContent = `Transcription: ${transcript}`;
        };

        recognition.onerror = () => {
            document.getElementById('stt-output').textContent = 'Error occurred during recording.';
        };

        // Voice Changer (simulated)
        document.getElementById('apply-voice').addEventListener('click', () => {
            const effect = document.getElementById('voice-effect').value;
            alert(`Applying ${effect} voice effect...`);
            document.getElementById('voice-changer-audio').classList.remove('hidden');
            document.getElementById('voice-changer-audio').src = `sample-${effect}.mp3`;
        });

        // Dubbing
        document.getElementById('dubbing-submit').addEventListener('click', () => {
            const file = document.getElementById('dubbing-file').files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                document.getElementById('dubbing-audio').classList.remove('hidden');
                document.getElementById('dubbing-audio').src = url;
                alert('Dubbing audio file...');
            } else {
                alert('Please select an audio file!');
            }
        });

        // Text to SFX
        document.getElementById('sfx-submit').addEventListener('click', () => {
            const text = document.getElementById('sfx-input').value;
            if (text.trim() === '') {
                alert('Please enter text for SFX generation!');
                return;
            }
            alert(`Generating SFX from text: "${text}"...`);
            document.getElementById('sfx-audio').classList.remove('hidden');
            document.getElementById('sfx-audio').src = 'sample-sfx.mp3';
        });

        // Create New Clone
        document.getElementById('create-clone-btn').addEventListener('click', () => {
            document.querySelector('.nav-btn-voice.active')?.classList.remove('active');
            document.querySelector('.section.active')?.classList.remove('active');
            document.getElementById('create-clone-btn').classList.add('active');
            document.querySelector('.create-clone-section').classList.add('active');
        });

        document.getElementById('clone-form').addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('clone-name').value;
            const file = document.getElementById('clone-audio').files[0];
            if (name.trim() && file) {
                document.getElementById('submit-clone').classList.add('loading');
                setTimeout(() => {
                    document.getElementById('submit-clone').classList.remove('loading');
                    document.getElementById('clone-message').textContent = `Clone "${name}" created successfully!`;
                    document.getElementById('clone-message').classList.remove('hidden');
                    this.reset();
                }, 1000);
            } else {
                alert('Please fill all fields!');
            }
        });

        // Close modal if clicked outside
        window.addEventListener('click', function (event) {
            const modal = document.getElementById('auth-modal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
   