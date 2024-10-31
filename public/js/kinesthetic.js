const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const submitButton = document.getElementById('submitButton');
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
      submitButton.disabled = false;
    };

    reader.readAsText(file);
  } else {
    alert('Please upload a valid .txt file.');
  }
});

submitButton.addEventListener('click', async () => {
  try {
    if (fileContent === '') {
      alert('Please upload a file before submitting!');
      return;
    }

    recommendationBox.innerHTML = `<p>Loading...</p>`;

    const response = await fetch('/api/kinesthetic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileContent }),
    });

    if (!response.ok) {
      console.log('Network response was not ok!');
    }

    const data = await response.json();

    console.log(data);

    // Check if 'choices' exists and has at least one element
    if (!data.choices || data.choices.length === 0) {
      recommendationBox.innerHTML = `<p>Sorry, no recommendations available. Check back later.</p>`;
      return;
    }

    // Check if 'message' exists in the first choice
    if (!data.choices[0].message || !data.choices[0].message.content) {
      recommendationBox.innerHTML = `<p>Sorry, no recommendations available. Check back later.</p>`;
      return;
    }

    const recommendations = data.choices[0].message.content;

    const recommendationList = recommendations
      .split('\n')
      .map((ele) => `<li>${ele}</li>`)
      .join('');

    recommendationBox.innerHTML = `<p>${recommendationList}</p>`;
  } catch (error) {
    console.log('Error occurred', error);
  }
});
