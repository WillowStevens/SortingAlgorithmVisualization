const container = document.getElementById('container');
const description = document.getElementById('description');
let n = 20;
let array = [];
let isSorting = false;
let isPaused = false;
let timeoutID = null;
let remainingMoves = [];
let speed = 150;

document.addEventListener('DOMContentLoaded', (event) => {
    randomizeArray(); // Generate first array and show the bars on program startup
});

function updateArraySize(value) {
    stopSorting();
    n = value;
    document.getElementById('arraysize-value').innerText = value;
    randomizeArray();
}

function updateSpeed(value) {
    speed = value;
    document.getElementById('speed-value').innerText = `${value} ms`;
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
    description.innerText = getDescription(sortFunction);
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
    timeoutID = setTimeout(animate, speed);
}

function bubbleSort(array) {
    const moves = [];
    let swapped;
	let counter = 0;
    do {
        swapped = false;
        for (let i = 0; i < array.length - 1 - counter; i++) {
            moves.push({indices: [i, i + 1], type: "comp"});
            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                moves.push({indices: [i, i + 1], type: "swap"});
                swapped = true;
            }
        }
		counter++;
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
    for (let i = 0; i < array.length; i++) {
        let minIndex = i;
        for (let j = i + 1; j < array.length; j++) {
            moves.push({indices: [minIndex, j], type: "comp"});
            if (array[j] < array[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex !== i) {
            [array[i], array[minIndex]] = [array[minIndex], array[i]];
            moves.push({indices: [i, minIndex], type: "swap"});
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
            bar.classList.add(move.type === "swap" ? "swapping" : "comparing");
        }
        container.appendChild(bar);
    }
}

function getDescription(sortFunction) {
    switch (sortFunction) {
        case bubbleSort:
            return "Bubble Sort: Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.";
        case insertionSort:
            return "Insertion Sort: Builds the final sorted array one item at a time, inserting elements into their correct position.";
        case selectionSort:
            return "Selection Sort: Repeatedly finds the minimum element from the unsorted part and puts it at the beginning.";
        default:
            return "";
    }
}
