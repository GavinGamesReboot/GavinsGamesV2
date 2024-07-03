document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        document.getElementById('textView').value = e.target.result;
    };

    if (file) {
        reader.readAsText(file);
    }
});

function saveFile() {
    const text = document.getElementById('textView').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const anchor = document.createElement('a');

    anchor.download = 'edited_file.txt';
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target = '_blank';
    anchor.style.display = 'none'; // just to be safe!
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

function convertTo(type) {
    const text = document.getElementById('textView').value;
    const blob = new Blob([text], { type: `text/${type}` });
    const anchor = document.createElement('a');

    anchor.download = `converted_file.${type}`;
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target = '_blank';
    anchor.style.display = 'none'; // just to be safe!
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

function convertToCustom() {
    const customType = document.getElementById('customType').value;
    if (!customType) {
        alert('Please enter a custom type.');
        return;
    }
    convertTo(customType);
}
