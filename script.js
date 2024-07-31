
        function encodeText(text) {
            return btoa(unescape(encodeURIComponent(text)));
        }

        function decodeText(text) {
            return decodeURIComponent(escape(atob(text)));
        }

        function encode() {
            const file = document.getElementById('encodeFile').files[0];
            const password = document.getElementById('encodePassword').value;
            const message = document.getElementById('encodeMessage').value;
            
            if (!file || !password || !message) {
                alert('Please provide all required information.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const encodedMessage = encodeText(password + '|' + message);
                    
                    if (encodedMessage.length * 8 > imageData.data.length) {
                        alert('Message is too long for this image.');
                        return;
                    }
                    
                    for (let i = 0; i < encodedMessage.length; i++) {
                        const charCode = encodedMessage.charCodeAt(i);
                        for (let j = 0; j < 8; j++) {
                            const bit = (charCode >> (7 - j)) & 1;
                            imageData.data[i * 8 + j] = (imageData.data[i * 8 + j] & 0xFE) | bit;
                        }
                    }
                    
                    // Add end of message marker
                    for (let i = 0; i < 8; i++) {
                        imageData.data[encodedMessage.length * 8 + i] = (imageData.data[encodedMessage.length * 8 + i] & 0xFE) | 1;
                    }
                    
                    ctx.putImageData(imageData, 0, 0);
                    
                    const encodedImage = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.href = encodedImage;
                    link.download = 'encoded_image.png';
                    link.click();

                    document.getElementById('debug').textContent = `Encoded message length: ${encodedMessage.length}`;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
        
        function decode() {
            const file = document.getElementById('decodeFile').files[0];
            const password = document.getElementById('decodePassword').value;
            
            if (!file || !password) {
                alert('Please provide all required information.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    let decodedMessage = '';
                    let charCode = 0;
                    
                    for (let i = 0; i < imageData.data.length; i++) {
                        const bit = imageData.data[i] & 1;
                        charCode = (charCode << 1) | bit;
                        
                        if ((i + 1) % 8 === 0) {
                            if (charCode === 255) { // End of message marker
                                break;
                            }
                            decodedMessage += String.fromCharCode(charCode);
                            charCode = 0;
                        }
                    }
                    
                    try {
                        const decoded = decodeText(decodedMessage);
                        const [storedPassword, message] = decoded.split('|');
                        
                        document.getElementById('debug').textContent = `
Decoded message length: ${decodedMessage.length}
Decoded text: ${decoded}
Stored password: ${storedPassword}
Entered password: ${password}
                        `;

                        if (storedPassword === password) {
                            document.getElementById('decodedMessage').value = message;
                        } else {
                            alert('Incorrect password');
                        }
                    } catch (e) {
                        alert('Failed to decode message');
                        console.error(e);
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
 