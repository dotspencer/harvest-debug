const input = document.querySelector('input');
const ctx = document.querySelector('canvas').getContext('2d');
console.log('ctx:', ctx);

input.addEventListener('change', handleFileInput);

function handleFileInput(event) {
  const file = input.files[0];
  const reader = new FileReader();
  reader.addEventListener('load', showGraph);
  reader.readAsText(file);
}

function showGraph(event) {
  const { result } = event.target;
  const data = parseData(result);

  const config = {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
  };
  const chart = new Chart(ctx, config);
}

function parseData(raw) {
  const rows = raw.split('\n');
  const labels = rows.shift().split(',');
  console.log('labels:', labels);

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
