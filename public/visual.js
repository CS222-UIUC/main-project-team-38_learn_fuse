document.addEventListener("DOMContentLoaded", function () {
    const uploadButton = document.getElementById("uploadButton");
    const submitButton = document.getElementById("submitButton");
    const fileInput = document.getElementById("fileInput");
    const outputText = document.getElementById("output-text");
  
    uploadButton.addEventListener("click", function () {
      fileInput.click(); // Simulate click on the file input
    });
  
    fileInput.addEventListener("change", function () {
      if (fileInput.files.length > 0) {
        submitButton.disabled = false;     }
    });
  
  
    submitButton.addEventListener("click", function () {
      outputText.textContent = 'Diagram loading...';
      
      setTimeout(() => {
        outputText.textContent = 'Diagram generated successfully!';     }, 2000);   });
  });
  
  
  