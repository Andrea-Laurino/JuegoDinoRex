//****** GAME LOOP ********//

let time = new Date();
let deltaTime = 0;

if (
	document.readyState === 'complete' ||
	document.readyState === 'interactive'
) {
	setTimeout(Init, 1);
} else {
	document.addEventListener('DOMContentLoaded', Init);
}

function Init() {
	time = new Date();
	Start();
	Loop();
}

function Loop() {
	deltaTime = (new Date() - time) / 1000;
	time = new Date();
	Update();
	requestAnimationFrame(Loop);
}

//****** GAME LOGIC ********//

let sueloY = 22;
let velY = 0;
let impulso = 900;
let gravedad = 2500;

let dinoPosX = 42;
let dinoPosY = sueloY;

let sueloX = 0;
let velEscenario = 1280 / 3;
let gameVel = 1;
let score = 0;

let parado = false;
let saltando = false;
let contadorActivo = true;
let contadorPausado = false;

let tiempoHastaObstaculo = 2;
let tiempoObstaculoMin = 0.7;
let tiempoObstaculoMax = 1.8;
let obstaculoPosY = 16;
let obstaculos = [];

let tiempoHastaNube = 0.5;
let tiempoNubeMin = 0.7;
let tiempoNubeMax = 2.7;
let maxNubeY = 270;
let minNubeY = 100;
let nubes = [];
let velNube = 0.5;

let contenedor;
let dino;
let textoScore;
let suelo;
let gameOver;
let scoreInterval;

function Start() {
	gameOver = document.querySelector('.game-over');
	suelo = document.querySelector('.suelo');
	contenedor = document.querySelector('.contenedor');
	textoScore = document.querySelector('.score');
	buttonFlow = document.getElementById('button-flow');
	dino = document.querySelector('.dino');
	document.addEventListener('keydown', HandleKeyDown);

	//asignar evento click al btn de pausa
	buttonFlow.addEventListener('click', () => {
		if (buttonFlow.classList.contains('play')) {
			resumeGame();
			buttonFlow.classList.remove('play');
		} else if (buttonFlow.classList.contains('reset')) {
			resetGame();
			buttonFlow.classList.remove('reset');
		} else {
			pauseGame();
			buttonFlow.classList.add('play');
		}
	});
}

function resetScore() {
	score = 0;
	textoScore.innerText = score;
}

function Reset() {
	gameVel = 1;
	score = 0;
	obstaculos = [];
	nubes = [];
	tiempoHastaObstaculo = 2;
	tiempoHastaNube = 0.5;
	sueloX = 0;
	dinoPosX = 42;
	dinoPosY = sueloY;
	velY = 0;
	parado = true;
	saltando = false;
	suelo.style.left = '0px';
	textoScore.innerText = '0';
	gameOver.style.display = 'none';
	contenedor.classList.remove('mediodia', 'tarde', 'noche');

	while (contenedor.firstChild) {
		contenedor.removeChild(contenedor.firstChild);
	}

	Start();
	Loop();
	resumeGame(Loop);
}

function resetGame() {
	Update();
	resumeGame();
	resetScore();
}

function Update() {
	if (parado) return;

	MoverDinosaurio();
	MoverSuelo();
	DecidirCrearObstaculos();
	DecidirCrearNubes();
	MoverObstaculos();
	MoverNubes();

	velY -= gravedad * deltaTime;
	DetectarColision();
}

window.addEventListener('load', () => {
	resetGame();
});

function HandleKeyDown(ev) {
	if (ev.keyCode == 32) {
		Saltar();
	}
}

function Saltar() {
	if (dinoPosY === sueloY) {
		saltando = true;
		velY = impulso;
		dino.classList.remove('dino-corriendo');
		GanarPuntos(); // Incrementar puntuación al saltar
	}
}

function MoverDinosaurio() {
	dinoPosY += velY * deltaTime;
	if (dinoPosY < sueloY) {
		TocarSuelo();
	}
	dino.style.bottom = dinoPosY + 'px';
}

function TocarSuelo() {
	dinoPosY = sueloY;
	velY = 0;
	if (saltando) {
		dino.classList.add('dino-corriendo');
	}
	saltando = false;
}

function MoverSuelo() {
	sueloX += CalcularDesplazamiento();
	suelo.style.left = -(sueloX % contenedor.clientWidth) + 'px';
}

function CalcularDesplazamiento() {
	return velEscenario * deltaTime * gameVel;
}

function Estrellarse() {
	dino.classList.remove('dino-corriendo');
	dino.classList.add('dino-estrellado');
	parado = true;
}

function DecidirCrearObstaculos() {
	tiempoHastaObstaculo -= deltaTime;
	if (tiempoHastaObstaculo <= 0) {
		CrearObstaculo();
	}
}

function DecidirCrearNubes() {
	tiempoHastaNube -= deltaTime;
	if (tiempoHastaNube <= 0) {
		CrearNube();
	}
}

function CrearObstaculo() {
	let obstaculo = document.createElement('div');
	contenedor.appendChild(obstaculo);
	obstaculo.classList.add('cactus');
	if (Math.random() > 0.5) obstaculo.classList.add('cactus2');
	obstaculo.posX = contenedor.clientWidth;
	obstaculo.style.left = contenedor.clientWidth + 'px';

	obstaculos.push(obstaculo);
	tiempoHastaObstaculo =
		tiempoObstaculoMin +
		(Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin)) / gameVel;
}

function CrearNube() {
	let nube = document.createElement('div');
	contenedor.appendChild(nube);
	nube.classList.add('nube');
	nube.posX = contenedor.clientWidth;
	nube.style.left = contenedor.clientWidth + 'px';
	nube.style.bottom = minNubeY + Math.random() * (maxNubeY - minNubeY) + 'px';

	nubes.push(nube);
	tiempoHastaNube =
		tiempoNubeMin + (Math.random() * (tiempoNubeMax - tiempoNubeMin)) / gameVel;
}

function MoverObstaculos() {
	for (let i = obstaculos.length - 1; i >= 0; i--) {
		if (obstaculos[i].posX < -obstaculos[i].clientWidth) {
			obstaculos[i].parentNode.removeChild(obstaculos[i]);
			obstaculos.splice(i, 1);
			GanarPuntos();
		} else {
			obstaculos[i].posX -= CalcularDesplazamiento();
			obstaculos[i].style.left = obstaculos[i].posX + 'px';
		}
	}
}

function MoverNubes() {
	for (let i = nubes.length - 1; i >= 0; i--) {
		if (nubes[i].posX < -nubes[i].clientWidth) {
			nubes[i].parentNode.removeChild(nubes[i]);
			nubes.splice(i, 1);
		} else {
			nubes[i].posX -= CalcularDesplazamiento() * velNube;
			nubes[i].style.left = nubes[i].posX + 'px';
		}
	}
}

function GanarPuntos() {
	if (contadorActivo && saltando) {
		score++;
		textoScore.innerText = score;
		evadeObstaculo = false;

		if (score === 5) {
			gameVel = 1.5;
			contenedor.classList.add('mediodia');
		} else if (score === 10) {
			gameVel = 2;
			contenedor.classList.add('tarde');
		} else if (score === 20) {
			gameVel = 3;
			contenedor.classList.add('noche');
		}
		suelo.style.animationDuration = 3 / gameVel + 's';
	}
}

function GameOver() {
	Estrellarse();
	gameOver.style.display = 'block';
	buttonFlow.classList.remove('reset');
	buttonFlow.classList.add('play');
	buttonFlow.addEventListener('click', restartGame);
}

function restartGame() {
	buttonFlow.removeEventListener('click', restartGame);
	buttonFlow.classList.remove('play');
	location.reload();
}

function DetectarColision() {
	for (let i = 0; i < obstaculos.length; i++) {
		if (
			obstaculos[i].posX > dinoPosX + dino.clientWidth ||
			dinoPosY !== sueloY
		) {
			evadeObstaculo = true;
			break;
		} else {
			if (IsCollision(dino, obstaculos[i], 10, 30, 15, 20)) {
				GanarPuntos();
				GameOver();
			}
		}
	}
}

function IsCollision(
	a,
	b,
	paddingTop,
	paddingRight,
	paddingBottom,
	paddingLeft
) {
	let aRect = a.getBoundingClientRect();
	let bRect = b.getBoundingClientRect();

	return !(
		aRect.top + aRect.height - paddingBottom < bRect.top ||
		aRect.top + paddingTop > bRect.top + bRect.height ||
		aRect.left + aRect.width - paddingRight < bRect.left ||
		aRect.left + paddingLeft > bRect.left + bRect.width
	);
}

function pauseGame() {
	parado = !parado;
	if (parado) {
		dino.classList.remove('dino-corriendo');
		contadorPausado = true;
		clearInterval(scoreInterval);
	} else {
		dino.classList.add('dino-corriendo');
		contadorPausado = false;
		scoreInterval = setInterval(() => {
			score++;
			textoScore.innerText = score;
		}, 1000);
	}
}

function resumeGame() {
	parado = false;
	dino.classList.add('dino-corriendo');
	resetScore();
}
