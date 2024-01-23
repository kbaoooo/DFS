document.getElementById('fileInput').addEventListener('change', function (event) {
    const fileInput = event.target;
    const file = fileInput.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const content = e.target.result;
        const lines = content.split('\n');

        // Process each line
        for (const line of lines) {
          console.log(line);
          console.log(line.split(', '))
          // You can perform actions on each line here
        }

        // Display all lines in the <pre> element
        document.getElementById('output').textContent = lines.join('\n');
      };

      reader.readAsText(file);
    }
  });