const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const submitButton = document.getElementById('submitButton');
const uploadStatus = document.getElementById('uploadStatus');
const recommendationBox = document.getElementById('recommendationBox');
const fileStatus = document.createElement('div');
fileStatus.className = 'file-status';
fileInput.parentNode.insertBefore(fileStatus, submitButton);

let fileContent = '';
let fileType = '';

uploadButton.addEventListener('click', () => {
  fileInput.click();
});

function displayActivities(activities, currentIndex = 0) {
  const activity = activities[currentIndex];
  return `
    <h2>Personalized Learning Activities</h2>
    <div class="carousel-container">
      <button class="carousel-arrow prev" ${currentIndex === 0 ? 'disabled' : ''} aria-label="Previous slide">←</button>
      
      <div class="activity-card">
        <h3>${activity.title}</h3>
        <div class="activity-details">
          ${activity.details.map((line) => `<p>${line}</p>`).join('')}
        </div>
      </div>
      
      <button class="carousel-arrow next" ${currentIndex === activities.length - 1 ? 'disabled' : ''} aria-label="Next slide">→</button>
      
      <div class="carousel-indicators">
        ${activities.length} slides - Showing ${currentIndex + 1} of ${activities.length}
      </div>
    </div>
  `;
}

function setupCarousel(activities, currentIndex) {
  const prevButton = document.querySelector('.carousel-arrow.prev');
  const nextButton = document.querySelector('.carousel-arrow.next');

  prevButton?.addEventListener('click', () => {
    console.log(currentIndex);
    if (currentIndex > 0) {
      currentIndex--;
      recommendationBox.innerHTML = displayActivities(activities, currentIndex);
      setupCarousel(activities, currentIndex);
    }
  });

  nextButton?.addEventListener('click', () => {
    console.log(currentIndex);
    if (currentIndex < activities.length - 1) {
      currentIndex++;
      recommendationBox.innerHTML = displayActivities(activities, currentIndex);
      setupCarousel(activities, currentIndex);
    }
  });
}

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];
  if (file && allowedTypes.includes(file.type)) {
    fileType = file.type;
    const reader = new FileReader();

    reader.onload = (event) => {
      fileContent = event.target.result.split(',')[1];
      submitButton.disabled = false;

      // fileStatus.innerHTML = `
      //   <div class="file-info">
      //     Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)
      //   </div>
      // `;
      uploadStatus.textContent = `File uploaded: ${file.name} of size ${(file.size / 1024).toFixed(2)} KB`;
      uploadStatus.classList.remove('error');
      uploadStatus.classList.add('success');
    };

    reader.readAsDataURL(file);
  } else {
    // alert('Please upload a valid file (.txt, .pdf, .doc, .docx)');
    uploadStatus.textContent =
      'Please upload a valid file (.txt, .pdf, .doc, .docx)';
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

    const targetElement = document.getElementsByClassName('auditory-recommendations')[0]

    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop,
        behavior: 'smooth'
      });
    }

    recommendationBox.innerHTML = `<p>Loading...</p>`;

    const response = await fetch('/api/kinesthetic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileContent, fileType }),
    });

    if (response.status == 413) {
      throw new Error(response.status);
    }

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No recommendations available');
    }

    const recommendations = data.choices[0].message.content;
    var currentIndex = 0;
    const activities = recommendations
      .split('GROQ-API-SUGG')
      .filter((section) => section.trim())
      .map((section) => {
        const formatted = section.replace(/^[\d.:]+/, '').trim();
        return {
          title: formatted.split('\n')[0],
          details: formatted.split('\n').slice(1),
        };
      });

    recommendationBox.innerHTML = `
      <div class="recommendations-container">
        ${displayActivities(activities, 0)}
      </div>
    `;
    setupCarousel(activities, currentIndex);
  } catch (error) {
    console.error('Error:', error);
    if (error.message == '413') {
      recommendationBox.innerHTML = `
      <div class="error-message">
        <p>The file is too large. Please try uploading a smaller file.</p>
      </div>
    `;
    } else {
      recommendationBox.innerHTML = `
        <div class="error-message">
          <p>Sorry, we couldn't generate recommendations at this time. Please try again later.</p>
        </div>
      `;
    }
  }
});
