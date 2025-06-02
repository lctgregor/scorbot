// =======================
// 🎮 Función para mover servos
// =======================
function updateServo(servoNumber, angle) {
  const valElement = document.getElementById("val" + servoNumber);
  if (valElement) valElement.textContent = angle;

  fetch(`http://192.168.4.1/servo?motor=${servoNumber}&angle=${angle}`)
    .then(response => response.text())
    .then(data => {
      console.log(`Servo ${servoNumber} -> ángulo ${angle}, respuesta: ${data}`);
    })
    .catch(error => {
      console.error("Error al enviar al ESP32:", error);
    });
}

// =======================
// 🌡️ Leer sensores
// =======================
function leerSensores() {
  fetch("http://192.168.4.1/sensores")
    .then(res => res.json())
    .then(data => {
      const tempEl = document.getElementById("temp");
      const humEl = document.getElementById("hum");
      if (tempEl && humEl) {
        tempEl.textContent = data.temperatura;
        humEl.textContent = data.humedad;
      }
    })
    .catch(error => {
      console.error("Error al obtener sensores:", error);
    });
}

// Actualizar sensores cada 3 segundos
setInterval(leerSensores, 3000);

// =======================
// 🤖 Ejecutar secuencias
// =======================
function ejecutarSecuencia(nombre) {
  fetch(`http://192.168.4.1/secuencia?nombre=${nombre}`);
}

// =======================
// 📊 Gráfico de temperatura
// =======================
let tiempo = 0;
const labels = [];
const dataTemp = [];

const canvasTemp = document.getElementById('graficoTemp');
let graficoTemp = null;

if (canvasTemp) {
  const ctx = canvasTemp.getContext('2d');
  graficoTemp = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperatura °C',
        data: dataTemp,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.3
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'Tiempo (s)' } },
        y: { min: 0, max: 50, title: { display: true, text: '°C' } }
      }
    }
  });
}

function actualizarGraficoTemp() {
  fetch('http://192.168.4.1/sensores')
    .then(res => res.json())
    .then(data => {
      if (!graficoTemp) return;

      tiempo += 3;
      if (labels.length > 10) {
        labels.shift();
        dataTemp.shift();
      }
      labels.push(`${tiempo}s`);
      dataTemp.push(data.temperatura);
      graficoTemp.update();
    })
    .catch(error => {
      console.error("Error al obtener datos del ESP32:", error);
    });
}

setInterval(actualizarGraficoTemp, 3000);

// =======================
// 🎨 Modo claro / oscuro (con DOMContentLoaded para asegurar carga)
// =======================
// Cambiar tema y guardar preferencia
const btnTema = document.getElementById("btnTema");
const body = document.body;

// Al cargar, aplicar tema guardado
const temaGuardado = localStorage.getItem("tema");
if (temaGuardado) {
  body.classList.remove("claro", "oscuro");
  body.classList.add(temaGuardado);
} else {
  // Default
  body.classList.add("claro");
}

btnTema.addEventListener("click", () => {
  if (body.classList.contains("claro")) {
    body.classList.remove("claro");
    body.classList.add("oscuro");
    localStorage.setItem("tema", "oscuro");
  } else {
    body.classList.remove("oscuro");
    body.classList.add("claro");
    localStorage.setItem("tema", "claro");
  }
});


// =======================
// ⌨️ Control por teclado
// =======================
document.addEventListener("keydown", (event) => {
  const step = 5;

  const s1 = document.getElementById("servo1");
  const s2 = document.getElementById("servo2");
  const s3 = document.getElementById("servo3");
  const s4 = document.getElementById("servo4");

  if (!s1 || !s2 || !s3 || !s4) return;

  let servo1 = parseInt(s1.value);
  let servo2 = parseInt(s2.value);
  let servo3 = parseInt(s3.value);
  let servo4 = parseInt(s4.value);

  switch (event.key) {
    case "ArrowUp":    servo1 = Math.min(servo1 + step, 180); break;
    case "ArrowDown":  servo1 = Math.max(servo1 - step, 0);   break;
    case "ArrowRight": servo2 = Math.min(servo2 + step, 180); break;
    case "ArrowLeft":  servo2 = Math.max(servo2 - step, 0);   break;
    case "w":          servo3 = Math.min(servo3 + step, 180); break;
    case "s":          servo3 = Math.max(servo3 - step, 0);   break;
    case "d":          servo4 = Math.min(servo4 + step, 180); break;
    case "a":          servo4 = Math.max(servo4 - step, 0);   break;
  }

  s1.value = servo1; document.getElementById("val1").textContent = servo1;
  s2.value = servo2; document.getElementById("val2").textContent = servo2;
  s3.value = servo3; document.getElementById("val3").textContent = servo3;
  s4.value = servo4; document.getElementById("val4").textContent = servo4;

  updateServo(1, servo1);
  updateServo(2, servo2);
  updateServo(3, servo3);
  updateServo(4, servo4);
});

// =======================
// 🔀 Mostrar secciones (navegación)
// =======================
function mostrarSeccion(nombre) {
  const secciones = {
    controles: document.getElementById("seccion-controles"),
    sensores: document.getElementById("seccion-sensores"),
  };

  for (const key in secciones) {
    if (secciones[key]) {
      secciones[key].style.display = (key === nombre) ? "block" : "none";
    }
  }
}
