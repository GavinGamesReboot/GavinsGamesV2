let img = null;

document.getElementById('imageInput').addEventListener('change', function() {
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        img = new Image();
        img.onload = function() {
            generateDotArt();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

document.getElementById('convertButton').addEventListener('click', generateDotArt);
document.getElementById('threshold').addEventListener('input', generateDotArt);
document.querySelectorAll('input[name="dithering"]').forEach(el => el.addEventListener('input', generateDotArt));
document.querySelectorAll('input[name="coloring"]').forEach(el => el.addEventListener('input', generateDotArt));
document.getElementById('maxChars').addEventListener('input', generateDotArt);
document.getElementById('horizontalGap').addEventListener('input', generateDotArt);
document.getElementById('verticalGap').addEventListener('input', generateDotArt);

function generateDotArt() {
    if (!img) {
        alert('Please select an image file.');
        return;
    }

    const threshold = parseInt(document.getElementById('threshold').value, 10);
    const maxChars = parseInt(document.getElementById('maxChars').value, 10);
    const dithering = document.querySelector('input[name="dithering"]:checked').value;
    const coloring = document.querySelector('input[name="coloring"]:checked').value;
    const horizontalGap = parseFloat(document.getElementById('horizontalGap').value);
    const verticalGap = parseFloat(document.getElementById('verticalGap').value);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);

    const imageData = context.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    // Calculate number of columns and rows based on maxChars
    const numCols = Math.sqrt(maxChars) * (img.width / img.height) * horizontalGap;
    const numRows = Math.sqrt(maxChars) * (img.height / img.width) * verticalGap;

    const widthStep = img.width / numCols;
    const heightStep = img.height / numRows;

    let dotArt = '';

    for (let y = 0; y < img.height; y += heightStep) {
        for (let x = 0; x < img.width; x += widthStep) {
            const index = (Math.floor(y) * img.width + Math.floor(x)) * 4;
            const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;

            let char = '';
            if (brightness < threshold) {
                char = coloring === 'whiteOnBlack' ? '⣿' : '⠂';
            } else {
                char = coloring === 'whiteOnBlack' ? '⠂' : '⣿';
            }

            dotArt += char;
        }
        dotArt += '\n';
    }

    document.getElementById('dotArt').textContent = dotArt;
}

document.getElementById('copyButton').addEventListener('click', function() {
    const dotArt = document.getElementById('dotArt').textContent;
    navigator.clipboard.writeText(dotArt).then(() => {
        alert('Dot Art copied to clipboard.');
    }).catch(err => {
        alert('Failed to copy dot art: ', err);
    });
});

document.getElementById('resetButton').addEventListener('click', function() {
    document.getElementById('imageInput').value = '';
    document.getElementById('threshold').value = '127';
    document.getElementById('maxChars').value = '2000';
    document.querySelector('input[name="dithering"][value="atkinson"]').checked = true;
    document.querySelector('input[name="coloring"][value="whiteOnBlack"]').checked = true;
    document.getElementById('horizontalGap').value = '2';
    document.getElementById('verticalGap').value = '1';
    document.getElementById('dotArt').textContent = '';
    img = null;
});
