const input = document.querySelector('input');
const ctx = document.querySelector('canvas').getContext('2d');

const divRunTime = document.querySelector('#run-time');
const divMinPressure = document.querySelector('#min-pressure');
const ulSequence = document.querySelector('#info-sequence');

let chart;

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

  // min pressure
  let minPressure = Infinity;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    minPressure = Math.min(minPressure, row['Pressure']);
  }
  divMinPressure.innerText = `${minPressure} mTorr`;

  // run time
  const runTime = rows.length - 1;
  if (runTime >= 60) {
    const hours = (runTime / 60).toFixed(1);
    divRunTime.innerText = `${hours} hours`
  }
  else {
    divRunTime.innerText = `${runTime} min`;
  }

  // info sequence
  ulSequence.innerHTML = '';
  const dupSequence = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const info = row['SN=11527'];
    const stage = row['Stage'];
    if (info) dupSequence.push({ info: true, val: info });
    if (stage) dupSequence.push({ val: stage });
  }
  const sequence = [];
  for (let i = 0; i < dupSequence.length; i++) {
    const curr = dupSequence[i];
    const prev = dupSequence[i - 1] || {};
    if (curr.val !== prev.val) {
      sequence.push(curr);
    }
  }
  const errorTags = ['Fail', 'Expire', 'Unable'];
  sequence.forEach(s => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.innerText = s.val;
    if (s.info) {
      li.classList.add('info');
    }
    if (errorTags.find(tag => s.val.includes(tag))) {
      li.classList.add('error');
    }
    li.appendChild(span);
    ulSequence.appendChild(li);
  });


  const GRAPH_MAX = 2500;
  const GRAPH_MIN = 100;

  const config = {
    type: 'line',
    data: {
      labels: rows.map((r, i) => `${i}m`),
      datasets: [{
        label: 'Pressure (mTorr)',
        data: rows.map(r => Math.min(GRAPH_MAX, parseInt(r['Pressure']))),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        pointRadius: 1,
        pointHitRadius: 5,
        tension: 0.1
      }, {
        label: '500 mTorr',
        data: rows.map(r => 500),
        pointRadius: 0,
        pointHitRadius: 0,
        borderWidth: 5,
      }],
    },
    options: {
      scales: {
        y: {
          min: GRAPH_MIN,
          max: GRAPH_MAX,
          ticks: {
          // forces step size to be 50 units
          stepSize: 100
        }
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
