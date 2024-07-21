document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('convertButton').addEventListener('click', convertToGIF);
document.getElementById('setStartTime').addEventListener('click', () => {
    if (document.getElementById('videoPreview').style.display !== 'none') {
        document.getElementById('startTime').value = document.getElementById('videoPreview').currentTime;
    } else {
        document.getElementById('startTime').value = document.getElementById('audioPreview').currentTime;
    }
});
document.getElementById('setEndTime').addEventListener('click', () => {
    if (document.getElementById('videoPreview').style.display !== 'none') {
        document.getElementById('endTime').value = document.getElementById('videoPreview').currentTime;
    } else {
        document.getElementById('endTime').value = document.getElementById('audioPreview').currentTime;
    }
});
document.getElementById('fullscreenButton').addEventListener('click', toggleFullScreen);
document.getElementById('customPixelButton').addEventListener('click', () => setPixelMode('custom'));
document.getElementById('selectPixelButton').addEventListener('click', () => setPixelMode('select'));

let pixelMode = 'select'; // Default pixel mode

function setPixelMode(mode) {
    pixelMode = mode;
    if (mode === 'custom') {
        document.getElementById('width').style.display = 'inline-block';
        document.getElementById('height').style.display = 'inline-block';
        document.getElementById('resolution').style.display = 'none';
        document.querySelector('label[for="resolution"]').style.display = 'none';
    } else if (mode === 'select') {
        document.getElementById('width').style.display = 'none';
        document.getElementById('height').style.display = 'none';
        document.getElementById('resolution').style.display = 'inline-block';
        document.querySelector('label[for="resolution"]').style.display = 'inline-block';
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    processFile(file);
}

function processFile(file) {
    if (file) {
        const fileType = file.type.split('/')[0];
        if (fileType === 'video') {
            const videoPreview = document.getElementById('videoPreview');
            videoPreview.src = URL.createObjectURL(file);
            videoPreview.style.display = 'block';
            document.getElementById('audioPreview').style.display = 'none';
            videoPreview.onloadedmetadata = () => {
                document.getElementById('settings').style.display = 'block';

                // Display input video specs
                const videoSpecs = document.getElementById('videoSpecs');
                videoSpecs.textContent = `Resolution: ${videoPreview.videoWidth}x${videoPreview.videoHeight}px, Duration: ${videoPreview.duration.toFixed(2)}s`;

                // Set default width and height to a lower resolution while keeping the aspect ratio
                const originalWidth = videoPreview.videoWidth;
                const originalHeight = videoPreview.videoHeight;
                const lowerResolutionWidth = 320; // Lower resolution width
                const aspectRatio = originalWidth / originalHeight;
                const lowerResolutionHeight = Math.round(lowerResolutionWidth / aspectRatio);
                
                document.getElementById('width').value = lowerResolutionWidth;
                document.getElementById('height').value = lowerResolutionHeight;

                // Show download link
                document.getElementById('downloadLink').style.display = 'inline-block';
            };
        } else if (fileType === 'audio') {
            const audioPreview = document.getElementById('audioPreview');
            audioPreview.src = URL.createObjectURL(file);
            audioPreview.style.display = 'block';
            document.getElementById('videoPreview').style.display = 'none';
            audioPreview.onloadedmetadata = () => {
                document.getElementById('settings').style.display = 'block';
                // Show download link
                document.getElementById('downloadLink').style.display = 'inline-block';
            };
        }
    }
}

function convertToGIF() {
    const video = document.getElementById('videoPreview');
    const startTime = parseFloat(document.getElementById('startTime').value);
    const endTime = parseFloat(document.getElementById('endTime').value);
    let width, height;

    if (pixelMode === 'custom') {
        width = parseInt(document.getElementById('width').value, 10);
        height = parseInt(document.getElementById('height').value, 10);
    } else {
        const resolution = document.getElementById('resolution').value.split('x');
        width = parseInt(resolution[0], 10);
        height = parseInt(resolution[1], 10);
    }

    const fps = parseInt(document.getElementById('fps').value, 10);
    const speed = parseFloat(document.getElementById('speed').value);

    const duration = endTime - startTime;
    const progressBar = document.getElementById('progressBar');
    progressBar.style.display = 'block';

    gifshot.createGIF({
        video: [video.src],
        gifWidth: width,
        gifHeight: height,
        interval: 1 / (fps / speed), // Correct interval to map speed
        numFrames: Math.ceil(duration * fps * speed),
        offset: startTime,
        numWorkers: 8, // Increase the number of workers to speed up the process
        sampleInterval: 1, // Adjust the sample interval for performance
        progressCallback: (progress) => {
            progressBar.value = progress * 100;
        }
    }, function (obj) {
        progressBar.style.display = 'none';
        progressBar.value = 0;
        if (!obj.error) {
            const image = obj.image,
                  blob = dataURItoBlob(image),
                  url = URL.createObjectURL(blob),
                  link = document.getElementById('downloadLink');

            document.getElementById('gifPreview').src = url;
            document.getElementById('gifPreview').style.display = 'block';
            document.querySelector('.gif-preview-container').style.display = 'flex';

            // Display GIF specs
            const gifSpecs = document.getElementById('gifSpecs');
            gifSpecs.textContent = `Resolution: ${width}x${height}px, Duration: ${duration}s, Speed: ${speed}x, Frames: ${fps}`;

            link.href = url;
            link.download = 'output.gif';
        }
    });
}

function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

function toggleFullScreen() {
    const gifPreview = document.getElementById('gifPreview');
    if (!document.fullscreenElement) {
        gifPreview.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
}
