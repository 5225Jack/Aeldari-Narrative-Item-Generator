let items = [];
let modifiers = [];

document.getElementById('upload').addEventListener('change', handleFile, false);
document.getElementById('generateBtn').addEventListener('click', generateRandomItems);

function handleFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    // Assume Sheet1 has items, Sheet2 has modifiers
    const itemSheet = workbook.SheetNames[0];
    const modSheet = workbook.SheetNames[1];

    items = XLSX.utils.sheet_to_json(workbook.Sheets[itemSheet], { header: 1 }).flat().filter(Boolean);
    modifiers = XLSX.utils.sheet_to_json(workbook.Sheets[modSheet], { header: 1 }).flat().filter(Boolean);

    alert('Excel file loaded! Items: ' + items.length + ', Modifiers: ' + modifiers.length);
  };

  reader.readAsArrayBuffer(file);
}

function generateRandomItems() {
  const numItems = parseInt(document.getElementById('numItems').value);
  const numModifiers = parseInt(document.getElementById('numModifiers').value);
  const outputDiv = document.getElementById('output');

  if (items.length === 0 || modifiers.length === 0) {
    outputDiv.innerHTML = '<div class="alert alert-warning">Please upload a valid Excel file with items and modifiers.</div>';
    return;
  }

  const results = [];

  for (let i = 0; i < numItems; i++) {
    const item = getRandomFromArray(items);
    const selectedMods = getMultipleRandom(modifiers, numModifiers);

    results.push({
      item,
      modifiers: selectedMods
    });
  }

  // Display results
  let html = '<table class="table table-dark table-bordered">';
  html += '<thead><tr><th>#</th><th>Item</th><th>Modifiers</th></tr></thead><tbody>';

  results.forEach((res, idx) => {
    html += `<tr><td>${idx + 1}</td><td>${res.item}</td><td>${res.modifiers.join(', ')}</td></tr>`;
  });

  html += '</tbody></table>';
  outputDiv.innerHTML = html;
}

// Helpers
function getRandomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getMultipleRandom(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}
