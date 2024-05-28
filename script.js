const container = document.getElementById('container');
let n = 20;
let array = [];
let isSorting = false;
let isPaused = false;
let timeoutID = null;
let remainingMoves = [];

document.addEventListener('DOMContentLoaded', (event) => {
    randomizeArray(); // Generate first array and show the bars on program startup
});

function updateArraySize(value) {
    stopSorting();
    n = value;
    document.getElementById('arraysize-value').innerText = value;
    randomizeArray();
}

function randomizeArray() {
    stopSorting();
    array = [];
    for (let i = 0; i < n; i++) {
        array[i] = Math.random();
    }
    showBars();
}

function play(sortFunction) {
    if (isSorting) {
        stopSorting();
        randomizeArray();
    }
    isSorting = true;
    isPaused = false;
    document.getElementById('pauseResumeButton').innerText = 'Pause';
    const copy = [...array];
    const moves = sortFunction(copy);
    remainingMoves = moves;
    animate();
}

function stopSorting() {
    isSorting = false;
    isPaused = false;
    if (timeoutID) {
        clearTimeout(timeoutID);
        timeoutID = null;
    }
    remainingMoves = [];
    document.getElementById('pauseResumeButton').innerText = 'Pause';
}

function pauseResume() {
    if (!isSorting) return;
    isPaused = !isPaused;
    if (isPaused) {
        document.getElementById('pauseResumeButton').innerText = 'Resume';
        if (timeoutID) {
            clearTimeout(timeoutID);
            timeoutID = null;
        }
    } else {
        document.getElementById('pauseResumeButton').innerText = 'Pause';
        animate();
    }
}

function animate() {
    if (remainingMoves.length === 0 || !isSorting) {
        showBars();
        isSorting = false;
        return;
    }
    if (isPaused) return;
    const move = remainingMoves.shift();
    const [i, j] = move.indices;

    if (move.type === "swap") {
        [array[i], array[j]] = [array[j], array[i]];
    }
    showBars(move);
    timeoutID = setTimeout(animate, 150);
}

function bubbleSort(array) {
    const moves = [];
    let swapped;
    do {
        swapped = false;
        for (let i = 0; i < array.length - 1; i++) {
            moves.push({indices: [i, i + 1], type: "comp"});
            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                moves.push({indices: [i, i + 1], type: "swap"});
                swapped = true;
            }
        }
    } while (swapped);
    return moves;
}
function insertionSort(array) {
    const moves = [];
    for (let i = 1; i < array.length; i++) {
        for (let j = i; j > 0 && array[j] < array[j - 1]; j--) {
            moves.push({indices: [j, j - 1], type: "comp"});
            [array[j], array[j - 1]] = [array[j - 1], array[j]];
            moves.push({indices: [j, j - 1], type: "swap"});
        }
    }
    return moves;
}
function selectionSort(array) {
	const moves = [];
	for(let i = 0; i<array.length;i++){
		let minIndex = i;
		for(let j = i+1; j < array.length;j++){
			moves.push({indices: [minIndex, j], type: "comp"});
			if(array[j] < array[minIndex]){
				minIndex = j;
			}
		}
		if(minIndex !== i){
			[array[i], array[minIndex]] = [array[minIndex], array[i]];
			moves.push({indices: [minIndex, i], type: "swap"});
		}
	}
	return moves;
}
function showBars(move) {
    container.innerHTML = "";
    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement("div");
        bar.style.height = array[i] * 100 + "%";
        bar.classList.add("bar");
        if (move && move.indices.includes(i)) {
            bar.style.backgroundColor = move.type === "swap" ? "red" : "blue";
        }
        container.appendChild(bar);
    }
}
