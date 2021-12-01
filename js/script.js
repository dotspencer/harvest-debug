const input = document.querySelector('input');
const ctx = document.querySelector('canvas').getContext('2d');
let chart;
console.log('ctx:', ctx);

input.addEventListener('change', handleFileInput);

function handleFileInput(event) {
  if (chart) {
    chart.destroy();
  }
  const file = input.files[0];
  const reader = new FileReader();
  reader.addEventListener('load', showGraph);
  reader.readAsText(file);
}

function showGraph(event) {
  const { result } = event.target;
  const rows = parseData(result);
  // console.log('rows:', rows);
  // console.log('dataset data:', rows.map(r => parseInt(r['Pressure'])));

  const config = {
    type: 'line',
    data: {
      labels: rows.map((r, i) => `T ${i}`),
      datasets: [{
        label: 'Pressure (mTorr)',
        data: rows.map(r => Math.min(2500, parseInt(r['Pressure']))),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }, {
        data: rows.map(r => 500),
        pointRadius: 0,
      }],
    },
    options: {
      scales: {
        y: {
          min: 100,
          max: 2500,
        }
      }
    },
  };
  chart = new Chart(ctx, config);
}

function parseData(raw) {
  const rows = raw.trim().split('\n');
  const labels = rows.shift().split(',');
  // console.log('labels:', labels);

  const data = [];

  for (let i = 0; i < rows.length; i++) {
    let parts;

    // remove commas from time formula
    if (rows[i].includes('+TIME')) {
      const cleaned = rows[i].split('"');
      cleaned[1] = cleaned[1].split(',').join(' ');
      parts = cleaned.join('').split(',');
    } else {
      parts = rows[i].split(',');
    }

    const d = {};
    for (let j = 0; j < labels.length; j++) {
      const cell = parts[j];
      if (cell && cell.trim()) {
        d[labels[j]] = cell;
      }
    }
    data.push(d);
  }

  return data;
}
