document.addEventListener('DOMContentLoaded', function () {
  const lineSelect = document.getElementById('lineSelect');
  const stationSelect = document.getElementById('stationSelect');
  const senseSelect = document.getElementById('senseSelect');
  const timeDisplay = document.getElementById('timeDisplay');
  const optgroupSense = 'Sentido';
  const optGroupStation = 'Estação';
  const fixedEstimatedTime = '0 horas e 0 minutos';

  toggleSenseStation();

  let lines = [];

  fetch('../../data/linhas.json')
    .then((response) => response.json())
    .then((data) => {
      lines = data.lines;
    })
    .catch((error) => console.error('Erro ao carregar o JSON', error));

  stationSelect.addEventListener('click', function () {
    removeInvalidOptions(stationSelect);
    let stationIndex = stationSelect.selectedIndex;
    if (
      stationIndex === -1 ||
      senseSelect.options[senseSelect.selectedIndex].text != optgroupSense
    ) {
      updateEstimatedTime();
    }
  });
  senseSelect.addEventListener('click', function () {
    removeInvalidOptions(senseSelect);
    let senseIndex = senseSelect.selectedIndex;
    let stationIndex = stationSelect.selectedIndex
    if (
      senseIndex === -1 ||
      senseSelect.options[senseSelect.selectedIndex].text === optgroupSense
    ) {
      senseSelect.selectedIndex = 0;
      senseSelect.options[0].text = optgroupSense;
    } else if(stationIndex != 0){
      updateEstimatedTime();
    }
  });

  lineSelect.addEventListener('change', function () {
    toggleSenseStation();
    let senseIndex = senseSelect.selectedIndex;
    let stationIndex = stationSelect.selectedIndex;
    if (senseIndex === -1 || stationIndex === -1) {
      senseSelect.selectedIndex = 0;
      senseSelect.options[0].text = optgroupSense;
      stationSelect.selectedIndex = 0;
      stationSelect.options[0].text = optGroupStation;
      timeDisplay.textContent = fixedEstimatedTime;
    }
  });

  function updateStations() {
    const lineValue = lineSelect.value;
    filterOptions(stationSelect, lineValue);
  }

  function updateSenses() {
    const lineValue = lineSelect.value;
    filterOptions(senseSelect, lineValue);
  }

  function filterOptions(selectedElement, value) {
    const options = selectedElement.querySelectorAll('option');
    options.forEach((option) => {
      option.style.display = option.value === value || option.value === '' ? 'block' : 'none';
    });
    selectedElement.value = '';
  }
  function toggleSenseStation() {
    updateStations();
    updateSenses();
  }

  function removeInvalidOptions(selectElement) {
    const options = selectElement.querySelectorAll('option');
    options.forEach((option) => {
      if (option.hasAttribute('disabled') && lineSelect.value !== '') {
        option.remove();
      }
    });
  }

  function updateEstimatedTime() {
    const lineValue = lineSelect.value;
    const stationValue = stationSelect.options[stationSelect.selectedIndex].text;
    const senseValue = senseSelect.options[senseSelect.selectedIndex].text;
    let estimatedTime = '0 horas e 0 minutos';

    if (lineValue && stationValue != optGroupStation && senseValue != optgroupSense) {
      const lineData = lines.find((line) => line.number === lineValue);
      if (lineData) {
        const headway = lineData.headway;
        const stations = lineData.stations;
        const percurso = headway * stations;
        if (percurso) {
          const completeRoute = lineData.completeRoute;

          const estacaoOrigemIndex = completeRoute.indexOf(stationValue);
          const estacaoDestinoIndex = completeRoute.indexOf(senseValue);

          if (estacaoOrigemIndex < 0 || estacaoDestinoIndex < 0) {
            alert('Estação ou sentido não encontrado');
            console.log(estacaoOrigemIndex, estacaoDestinoIndex);
            return;
          }
          if (estacaoOrigemIndex !== estacaoDestinoIndex) {
            const qntEstacoesPercurso = Math.abs(estacaoDestinoIndex - estacaoOrigemIndex);
            const timePorEstacao = percurso / (completeRoute.length - 1);
            const totaltime = headway + timePorEstacao * qntEstacoesPercurso;
            const roundTotalTime = Math.round(totaltime);
            const hours = Math.floor(roundTotalTime / 60);
            const minutes = roundTotalTime % 60;
            estimatedTime = `${hours} horas(s) e ${minutes} minuto(s)`;
          }
        } else {
          alert('Percurso não encontrado');
          console.log(percurso);
        }
      } else {
        alert('Linha não encontrada ');
      }
    } else {
      alert('Valores necessários não estão definidos.');
    }
    timeDisplay.textContent = estimatedTime;
  }
});
