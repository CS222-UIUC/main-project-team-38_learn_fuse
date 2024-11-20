const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const submitButton = document.getElementById('submitButton');
const uploadStatus = document.getElementById('uploadStatus');
const auditoryFileOutput = document.getElementById('auditoryFileOutput');
const recommendationBox = document.getElementById('recommendationBox');

let fileContent = '';
let fileType = '';

async function updateRecommendations() {
  try {
      const response = await fetch('/api/video/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileContent, fileType }),
      });

      if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();

      console.log(data);
      
      // Update recommendation box
      recommendationBox.innerHTML = `
          <h3>Video Recommendations</h3>
          ${data.recommendations.map(video => `
              <div class="video-recommendation">
                  <h4>${video.title}</h4>
                  <p class="video-source">${video.source}</p>
                  <p class="video-description">${video.description}</p>
                  <a href="${video.url}" target="_blank" rel="noopener noreferrer" class="video-link">
                      Watch Video
                  </a>
              </div>
          `).join('')}
      `;
  } catch (error) {
      console.error('Error fetching recommendations:', error);
      recommendationBox.innerHTML = '<p>Failed to load video recommendations</p>';
  }
}

uploadButton.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file && file.type == 'text/plain') {
    const reader = new FileReader();

    reader.onload = (event) => {
      fileContent = event.target.result.split(',')[1];
      fileType = file.type;

      uploadStatus.textContent = `File uploaded: ${file.name} of size ${(file.size / 1024).toFixed(2)} KB`;
      uploadStatus.classList.remove('error');
      uploadStatus.classList.add('success');
    };

    reader.readAsDataURL(file);
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

      // Fetch video recommendations
      await updateRecommendations();

      // Your existing text-to-speech API call
      const response = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: fileContent.slice(0, 200) }),
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data);
      
      alert('File upload successful!');
  } catch (error) {
      console.error('Error occurred:', error);
      recommendationBox.innerHTML = '<p>Error loading recommendations</p>';
  }
});

auditoryFileOutput.addEventListener('click', () => {
  if (fileContent === '') {
    alert('Please upload a file before trying to download!');
    return;
  }

  window.location.href = '/api/text-to-speech/download';
});
