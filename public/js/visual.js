let fileContent = '';
let fileType = '';

const allowedTypes = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

clearText();

document.querySelectorAll('.button-container button').forEach((button) => {
  button.addEventListener('mousedown', (event) => {
    event.preventDefault();
    document.getElementById('notesArea').focus();
  });
});

function saveNotes() {
  const notes = document.getElementById('notesArea').innerHTML;
  if (notes.trim()) {
    alert('Notes saved!');
    // actually save it
  } else {
    alert('Please enter some notes before saving.');
  }
}

function updateFileInfo(file) {
  const fileInfo = document.getElementById('fileInfo');
  if (file) {
    const fileSize = (file.size / 1024).toFixed(2);
    fileInfo.innerHTML = `Selected: ${file.name} (${fileSize} KB)`;
    fileInfo.style.display = 'block';
  } else {
    fileInfo.innerHTML = '';
    fileInfo.style.display = 'none';
  }
}

document.getElementById('fileInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file && allowedTypes.includes(file.type)) {
    const reader = new FileReader();

    reader.onload = (e) => {
      fileContent = e.target.result.split(',')[1];
    };

    reader.readAsDataURL(file);
  }
  updateFileInfo(file);
});

// document
//   .getElementById('uploadForm')
//   .addEventListener('submit', async function (e) {
//     e.preventDefault();
//     const file = document.getElementById('fileInput').files[0];
//     if (file) {
//       const formData = new FormData();
//       formData.append('file', file);
//       try {
//         const response = await fetch('/api/scribble', {
//           method: 'POST',
//           body: formData,
//         });
//         if (!response.ok) {
//           throw new Error('Upload failed');
//         }
//         const data = await response.json();
//         document.getElementById('outputBox').value = data.content;
//       } catch (error) {
//         console.error('Error:', error);
//         // alert('Error uploading file');
//         if (error.message == '413') {
//             alert('The file is too large. Please try uploading a smaller file.');
//         } else {
//             alert('Sorry, we couldn\'t generate recommendations at this time. Please try again later.');
//         }
//       }
//     } else {
//       alert('Please select a file first.');
//     }
//   });

document
  .getElementById('uploadForm')
  .addEventListener('submit', async function (e) {
    e.preventDefault();
    const file = document.getElementById('fileInput').files[0];
    if (file && allowedTypes.includes(file.type)) {
      try {
        fileType = file.type;
        if (fileContent === '') {
          alert('Please upload a file before submitting!');
          return;
        }
        document.getElementById('outputBox').value = 'Loading...';
        const response = await fetch('/api/visual', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileContent, fileType }),
        });
        document.getElementById('outputBox').value = '';
        if (response.status == 413) {
          throw new Error(response.status);
        }
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        const data = await response.json();
        document.getElementById('outputBox').value = data.content;
        document.getElementById('recommendationBox').value = data.content;
      } catch (error) {
        console.error('Error:', error);
        // alert('Error uploading file');
        if (error.message == '413') {
          alert('The file is too large. Please try uploading a smaller file.');
        } else {
          alert(
            "Sorry, we couldn't generate recommendations at this time. Please try again later."
          );
        }
      }
    } else {
      alert('Please upload a valid file (.txt, .pdf, .doc, .docx)');
    }
  });
// check functionality - not working?
const dropZone = document.querySelector('.file-upload');

dropZone.addEventListener('dragover', function (e) {
  e.preventDefault();
  this.classList.add('dragover');
});

dropZone.addEventListener('dragleave', function (e) {
  e.preventDefault();
  this.classList.remove('dragover');
});

dropZone.addEventListener('drop', function (e) {
  e.preventDefault();
  this.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) {
    document.getElementById('fileInput').files = e.dataTransfer.files;
    updateFileInfo(file);
  }
});

function toggleBold() {
  document.execCommand('bold');
}

function toggleItalic() {
  document.execCommand('italic');
}

function alignText(alignment) {
  document.getElementById('notesArea').style.textAlign = alignment;
}

function transformText(transformType) {
  const notesArea = document.getElementById('notesArea');
  const selection = window.getSelection();
  const selectedText = selection.toString();

  if (selectedText.length > 0) {
    let transformedText = selectedText;

    switch (transformType) {
      case 'uppercase':
        transformedText = selectedText.toUpperCase();
        break;
      case 'lowercase':
        transformedText = selectedText.toLowerCase();
        break;
      case 'capitalize':
        transformedText = selectedText.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        );
        break;
      default:
        return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(transformedText));
  } else {
    switch (transformType) {
      case 'uppercase':
        notesArea.innerHTML = notesArea.innerHTML.toUpperCase();
        break;
      case 'lowercase':
        notesArea.innerHTML = notesArea.innerHTML.toLowerCase();
        break;
      case 'capitalize':
        notesArea.innerHTML = notesArea.innerHTML.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        );
        break;
    }
  }
}

function clearText() {
  const notesArea = document.getElementById('notesArea');
  notesArea.innerHTML = '';
  notesArea.style.fontWeight = 'normal';
  notesArea.style.fontStyle = 'normal';
  notesArea.style.textAlign = 'left';
  notesArea.style.textTransform = 'none';
}



