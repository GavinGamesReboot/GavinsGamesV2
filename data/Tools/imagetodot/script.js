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
document.getElementById('widthFactor').addEventListener('input', generateDotArt);
document.getElementById('heightFactor').addEventListener('input', generateDotArt);
document.getElementById('maxChars').addEventListener('input', generateDotArt);
document.getElementById('coloringOption').addEventListener('input', generateDotArt);

function generateDotArt() {
    if (!img) {
        alert('Please select an image file.');
        return;
    }

    const maxChars = parseInt(document.getElementById('maxChars').value, 10);
    const coloringOption = document.getElementById('coloringOption').value;
    const widthFactor = parseInt(document.getElementById('widthFactor').value, 10);
    const heightFactor = parseInt(document.getElementById('heightFactor').value, 10);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);

    const imageData = context.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    const numCols = Math.sqrt(maxChars) * widthFactor;
    const numRows = Math.sqrt(maxChars) * heightFactor;

    const widthStep = img.width / numCols;
    const heightStep = img.height / numRows;

    let dotArt = '';

    for (let y = 0; y < img.height; y += heightStep) {
        for (let x = 0; x < img.width; x += widthStep) {
            const index = (Math.floor(y) * img.width + Math.floor(x)) * 4;
            const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
            if (brightness < 128) {
                dotArt += coloringOption === 'whiteOnBlack' ? ' ' : '#';
            } else {
                dotArt += coloringOption === 'whiteOnBlack' ? '#' : ' ';
            }
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
    document.getElementById('maxChars').value = '100';
    document.getElementById('widthFactor').value = '1';
    document.getElementById('heightFactor').value = '1';
    document.getElementById('coloringOption').value = 'whiteOnBlack';
    document.getElementById('dotArt').textContent = '';
    img = null;
});
