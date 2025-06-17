let weaponList = [];
let modifierPool1 = [];
let modifierPool2 = [];

document.getElementById('upload').addEventListener('change', handleFile, false);
document.getElementById('generateBtn').addEventListener('click', generateRandomItems);

function handleFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Reset lists
    weaponList = [];
    modifierPool1 = [];
    modifierPool2 = [];

    rows.slice(1).forEach(row => {
      const weapon = row[0]?.trim();
      const mod1 = row[1]?.trim();
      const mod2 = row[2]?.trim();

      if (weapon) weaponList.push(weapon);
      if (mod1) modifierPool1.push(mod1);
      if (mod2) modifierPool2.push(mod2);
    });

    alert(`Loaded! Weapons: ${weaponList.length}, Modifier 1s: ${modifierPool1.length}, Modifier 2s: ${modifierPool2.length}`);
  };

  reader.readAsArrayBuffer(file);
}

function generateRandomItems() {
  const numItems = parseInt(document.getElementById('numItems').value);
  const useRandomModifiers = document.getElementById('randomToggle').checked;
  const outputDiv = document.getElementById('output');

  if (weaponList.length === 0 || (modifierPool1.length === 0 && modifierPool2.length === 0)) {
    outputDiv.innerHTML = '<div class="alert alert-warning">Please upload a valid Excel file first.</div>';
    return;
  }

  const results = [];

  for (let i = 0; i < numItems; i++) {
    const weapon = getRandomFromArray(weaponList);
    const isMeleeOnly = weapon.toLowerCase().includes('(melee only)');
    const numModifiers = useRandomModifiers ? getRandomInt(1, 3) : parseInt(document.getElementById('numModifiers').value);

    let chosenMods = [];

    if (isMeleeOnly) {
      chosenMods = getMultipleRandom(modifierPool2, numModifiers);
    } else {
      const combinedPool = [...modifierPool1, ...modifierPool2];
      chosenMods = getMultipleRandom(combinedPool, numModifiers);
    }

    results.push({ weapon, modifiers: chosenMods });
  }

  // Display
  let html = '<table class="table table-dark table-bordered">';
  html += '<thead><tr><th>#</th><th>Weapon</th><th>Modifiers</th></tr></thead><tbody>';

  results.forEach((entry, idx) => {
    html += `<tr><td>${idx + 1}</td><td>${entry.weapon}</td><td>${entry.modifiers.join(', ')}</td></tr>`;
  });

  html += '</tbody></table>';
  outputDiv.innerHTML = html;
}

// Utility functions
function getRandomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getMultipleRandom(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
