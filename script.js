const container = document.getElementById('container');
let n = 20;
let array = [];
let isSorting = false;
let timeoutID = null;

document.addEventListener('DOMContentLoaded', (event) => {
    init(); // Generate first array and show the bars on program startup
});

function updateArraySize(value) {
    stopSorting();
    n = value;
    document.getElementById('arraysize-value').innerText = value;
    init();
}

function init() {
    stopSorting();
    array = [];
    for (let i = 0; i < n; i++) {
        array[i] = Math.random();
    }
    showBars();
}

function play() {
    if (isSorting) {
        stopSorting();
        init();
    }
    isSorting = true;
    const copy = [...array];
    const moves = bubbleSort(copy);
    animate(moves);
}

function stopSorting() {
    isSorting = false;
    if (timeoutID) {
        clearTimeout(timeoutID);
        timeoutID = null;
    }
}

function animate(moves) {
    if (moves.length === 0 || !isSorting) {
        showBars();
        isSorting = false;
        return;
    }
    const move = moves.shift();
    const [i, j] = move.indicies;

    if (move.type === "swap") {
        [array[i], array[j]] = [array[j], array[i]];
    }
    showBars(move);
    timeoutID = setTimeout(function () {
        animate(moves);
    }, 150);
}

function bubbleSort(array) {
    const moves = [];
    do {
        var swapped = false;
        for (let i = 1; i < array.length; i++) {
            moves.push({indicies: [i - 1, i], type: "comp"});
            if (array[i - 1] > array[i]) {
                swapped = true;
                moves.push({indicies: [i - 1, i], type: "swap"});
                [array[i - 1], array[i]] = [array[i], array[i - 1]];
            }
        }
    } while (swapped);
    return moves;
}

function showBars(move) {
    container.innerHTML = "";
    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement("div");
        bar.style.height = array[i] * 100 + "%";
        bar.classList.add("bar");
        if (move && move.indicies.includes(i)) {
            bar.style.backgroundColor = move.type === "swap" ? "red" : "blue";
        }
        container.appendChild(bar);
    }
}
