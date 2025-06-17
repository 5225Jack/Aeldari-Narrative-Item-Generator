let weaponList = [];
let modifierPool1 = [];
let modifierPool2 = [];

document.getElementById('upload').addEventListener('change', handleFile, false);
document.getElementById('generateBtn').addEventListener('click', generateRandomItems);

let activeProcessor = null;

function handleFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (!rows.length || !rows[0][0]) {
      alert('Invalid or empty Excel file.');
      return;
    }

    handleDataBasedOnHeader(rows);
  };

  reader.readAsArrayBuffer(file);
}

function handleDataBasedOnHeader(rows) {
  const header = rows[0][0].toLowerCase().trim();

  if (header === "weapon") {
    activeProcessor = () => processWeaponList(rows);
    alert("Detected Weapon list — weapon logic enabled.");
  } else if (header === "vehicle") {
    activeProcessor = () => processVehicleList(rows);
    alert("Detected Vehicle list — vehicle logic enabled.");
  } else {
    alert(`Unrecognized first column header: "${header}"`);
    activeProcessor = null;
  }
}

function generateRandomItems() {
  if (activeProcessor) {
    activeProcessor();
  } else {
    document.getElementById('output').innerHTML = '<div class="alert alert-danger">No valid Excel data loaded.</div>';
  }
}

//
// ========== WEAPON LOGIC ==========
//

function processWeaponList(rows) {
  const useRandomModifiers = document.getElementById('randomToggle').checked;
  const numItems = parseInt(document.getElementById('numItems').value);
  const modifierCount = parseInt(document.getElementById('numModifiers').value);

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

  if (weaponList.length === 0) {
    document.getElementById('output').innerHTML = '<div class="alert alert-warning">No weapons found in file.</div>';
    return;
  }

  const results = [];

  for (let i = 0; i < numItems; i++) {
    const weapon = getRandomFromArray(weaponList);
    const isMeleeOnly = weapon.toLowerCase().includes('(melee only)');
    const chosenCount = useRandomModifiers ? getRandomInt(1, 3) : modifierCount;

    const pool = isMeleeOnly ? modifierPool2 : modifierPool1;
    const chosenModifiers = getFilteredRandomModifiers(pool, chosenCount);

    results.push({ weapon, modifiers: chosenModifiers });
  }

  renderWeaponTable(results);
}

function renderWeaponTable(results) {
  let html = '<table class="table table-dark table-bordered">';
  html += '<thead><tr><th>#</th><th>Weapon</th><th>Modifiers</th></tr></thead><tbody>';

  results.forEach((entry, idx) => {
    const cleanedMods = entry.modifiers.map(m => m.replace(/^\*\s*/, '').trim());
    html += `<tr>
      <td>${idx + 1}</td>
      <td>${entry.weapon}</td>
      <td>${cleanedMods.join(', ')}</td>
    </tr>`;
  });

  html += '</tbody></table>';
  document.getElementById('output').innerHTML = html;
}

//
// ========== VEHICLE LOGIC ==========
//

function processVehicleList(rows) {
  const useRandomModifiers = document.getElementById('randomToggle').checked;
  const numItems = parseInt(document.getElementById('numItems').value);
  const modifierCount = parseInt(document.getElementById('numModifiers').value);

  const vehicles = [];
  const standardModifiers = [];
  const oneUseModifiers = [];

  rows.slice(1).forEach(row => {
    const vehicle = row[0]?.trim();
    const mod2 = row[1]?.trim(); // standard
    const mod3 = row[2]?.trim(); // one-use

    if (vehicle) vehicles.push(vehicle);
    if (mod2) standardModifiers.push(mod2);
    if (mod3) oneUseModifiers.push(mod3);
  });

  if (vehicles.length === 0) {
    document.getElementById('output').innerHTML = '<div class="alert alert-warning">No vehicles found in file.</div>';
    return;
  }

  const results = [];

  for (let i = 0; i < numItems; i++) {
    const vehicle = getRandomFromArray(vehicles);
    const isOneUse = vehicle.toLowerCase().includes('(one use)');
    const chosenCount = useRandomModifiers ? getRandomInt(1, 3) : modifierCount;

    const pool = isOneUse ? oneUseModifiers : standardModifiers;
    const chosenModifiers = getFilteredRandomModifiers(pool, chosenCount);

    results.push({
      vehicle,
      modifiers: chosenModifiers
    });
  }

  renderVehicleTable(results);
}

function renderVehicleTable(results) {
  let html = '<table class="table table-dark table-bordered">';
  html += '<thead><tr><th>#</th><th>Vehicle</th><th>Modifiers</th></tr></thead><tbody>';

  results.forEach((entry, idx) => {
    const cleanedMods = entry.modifiers.map(m => m.replace(/^\*\s*/, '').trim());
    html += `<tr>
      <td>${idx + 1}</td>
      <td>${entry.vehicle}</td>
      <td>${cleanedMods.join(', ')}</td>
    </tr>`;
  });

  html += '</tbody></table>';
  document.getElementById('output').innerHTML = html;
}

//
// ========== UTILITIES ==========
//

function getFilteredRandomModifiers(pool, maxCount) {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const result = [];

  for (let i = 0; i < shuffled.length && result.length < maxCount; i++) {
    const mod = shuffled[i];
    const isAsterisk = mod.trim().startsWith('*');
    const hasAsteriskAlready = result.some(m => m.trim().startsWith('*'));

    if (isAsterisk && hasAsteriskAlready) continue;
    result.push(mod);
  }

  return result;
}

function getRandomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
