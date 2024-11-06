const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const submitButton = document.getElementById('submitButton');
const uploadStatus = document.getElementById('uploadStatus');
const auditoryFileOutput = document.getElementById('auditoryFileOutput');
const recommendationBox = document.getElementById('recommendationBox');

let fileContent = '';

uploadButton.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file && file.type == 'text/plain') {
    const reader = new FileReader();

    reader.onload = (event) => {
      fileContent = event.target.result;

      uploadStatus.textContent = `File uploaded: ${file.name} of size ${(file.size / 1024).toFixed(2)} KB`;
      uploadStatus.classList.remove('error');
      uploadStatus.classList.add('success');
    };

    reader.readAsText(file);
  } else {
    uploadStatus.textContent = 'Please upload a valid .txt file.';
    uploadStatus.classList.add('error');
    uploadStatus.classList.remove('success');
  }
});

submitButton.addEventListener('click', async () => {
  try {
    if (fileContent === '') {
      alert('Please upload a file before submitting!');
      return;
    }

    recommendationBox.innerHTML = `<p>Loading...</p>`;

    alert('File upload successful!');

    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: fileContent }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    console.log(data);
  } catch (error) {
    console.log('Error occurred', error);
  }
});

auditoryFileOutput.addEventListener('click', () => {
  if (fileContent === '') {
    alert('Please upload a file before trying to download!');
    return;
  }

  window.location.href = '/api/text-to-speech/download';
});
