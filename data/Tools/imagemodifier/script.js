const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let originalImage = null;
let aspectRatio = null;

document.getElementById('upload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            originalImage = img;
            aspectRatio = img.width / img.height;
            displayResolution(img.width, img.height);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

function updateDimensions(changed) {
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const maintainAspectRatio = document.getElementById('aspect-ratio').checked;

    if (originalImage && maintainAspectRatio) {
        if (changed === 'width' && widthInput.value) {
            heightInput.value = Math.round(widthInput.value / aspectRatio);
        } else if (changed === 'height' && heightInput.value) {
            widthInput.value = Math.round(heightInput.value * aspectRatio);
        }
    }
}

function resizeByPixels() {
    let width = parseInt(document.getElementById('width').value);
    let height = parseInt(document.getElementById('height').value);
    
    if (width && height && originalImage) {
        resizeImage(width, height);
    }
}

function resizeByPercentage() {
    const percentage = parseInt(document.getElementById('percentage').value);
    if (percentage && originalImage) {
        const width = originalImage.width * (percentage / 100);
        const height = originalImage.height * (percentage / 100);
        resizeImage(width, height);
    }
}

function resizeImage(width, height) {
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(originalImage, 0, 0, width, height);
    displayResolution(width, height);
}

function removeBackground() {
    if (originalImage) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) {
                data[i + 3] = 0; // Make the pixel transparent
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = 'modified-image.png';
    link.href = canvas.toDataURL();
    link.click();
}

function displayResolution(width, height) {
    document.getElementById('resolution').innerText = `Resolution: ${width} x ${height}`;
}
