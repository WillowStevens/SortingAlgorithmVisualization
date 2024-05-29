const container = document.getElementById('container');
const algorithmInfo = document.getElementById('algorithm-info');
let n = 20;
let array = [];
let isSorting = false;
let isPaused = false;
let timeoutID = null;
let remainingMoves = [];
let speed = 50;
let sortedIndices = new Set();
let currentPivotIndex = null;
let audioCtx = null;
let muted = true;

document.addEventListener('DOMContentLoaded', () => {
    randomizeArray();
    updateAlgorithmInfo();
});

function playNote(freq){
	if(audioCtx === null){
		audioCtx=new(
			AudioContext ||
			webkitAudioContext ||
			window.webkitAudioContext
			)();
	}
	const dur=0.1;
	const osc=audioCtx.createOscillator();
	osc.frequency.value=freq;
	if(!muted){
		osc.start();
		osc.stop(audioCtx.currentTime+dur);
		const node = audioCtx.createGain();
		node.gain.value=0.1;
		node.gain.linearRampToValueAtTime(
			0, audioCtx.currentTime+dur
		);
		osc.connect(node);
		node.connect(audioCtx.destination);
	}
}

function updateArraySize(value) {
    stopSorting();
    n = value;
    document.getElementById('arraysize-value').innerText = value;
    randomizeArray();
}

function updateMute(value) {
    muted = value;
}

function updateSpeed(value) {
    speed = value;
    document.getElementById('speed-value').innerText = `${value} ms`;
}

function randomizeArray() {
    stopSorting();
    array = [];
    sortedIndices.clear();
    currentPivotIndex = null;
    for (let i = 0; i < n; i++) {
        array[i] = Math.random();
    }
    showBars();
}

function playSelectedAlgorithm() {
    const algorithm = document.getElementById('algorithm').value;
    const sortFunction = getSortFunction(algorithm);
    if (sortFunction) {
        startSorting(sortFunction);
    }
}

function getSortFunction(name) {
    switch (name) {
        case 'bubbleSort': return bubbleSort;
        case 'insertionSort': return insertionSort;
        case 'selectionSort': return selectionSort;
        case 'mergeSort': return mergeSort;
        case 'quickSort': return quickSort;
        default: return null;
    }
}

function startSorting(sortFunction) {
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
    sortedIndices.clear();
    currentPivotIndex = null;
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

function step() {
    if (!isSorting) {
        const algorithm = document.getElementById('algorithm').value;
        const sortFunction = getSortFunction(algorithm);
        if (sortFunction) {
            initializeStep(sortFunction);
			isPaused = true;
			document.getElementById('pauseResumeButton').innerText = 'Resume';
        }
    } else if (remainingMoves.length === 0) {
        showBars(null, true);
        isSorting = false;
    } else {
        executeStep();
		isPaused = true;
		document.getElementById('pauseResumeButton').innerText = 'Resume';
    }
}

function initializeStep(sortFunction) {
    isSorting = true;
    const copy = [...array];
    const moves = sortFunction(copy);
    remainingMoves = moves;
    executeStep();
}

function executeStep() {
    const move = remainingMoves.shift();
    if (move.indices) {
        const [i, j] = move.indices;
        if (i != null) { playNote(300 + array[i] * 500); }
        if (j != null) { playNote(300 + array[j] * 500); }
        if (move.type === "swap") {
            [array[i], array[j]] = [array[j], array[i]];
        } else if (move.type === "place") {
            array[i] = move.value;
        }
    }
    if (move.sortedIndex !== undefined) {
        sortedIndices.add(move.sortedIndex);
    }
    if (move.type === "pivot") {
        currentPivotIndex = move.index;
    }
    showBars(move);
}

function animate() {
    if (remainingMoves.length === 0 || !isSorting) {
        showBars(null, true);
        isSorting = false;
        return;
    }
    if (isPaused) return;
    executeStep();
    timeoutID = setTimeout(animate, speed);
}

function bubbleSort(array) {
    const moves = [];
    let sortedIndex = array.length;
    do {
        let swapped = false;
        for (let i = 0; i < sortedIndex - 1; i++) {
            moves.push({ indices: [i, i + 1], type: "comp" });
            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                moves.push({ indices: [i, i + 1], type: "swap" });
                swapped = true;
            }
        }
        sortedIndex--;
        if (!swapped) {
            break;
        }
        moves.push({ sortedIndex: sortedIndex });
    } while (sortedIndex > 0);
    return moves;
}

function insertionSort(array) {
    const moves = [];
    for (let i = 1; i < array.length; i++) {
        let j = i;
        while (j > 0 && array[j] < array[j - 1]) {
            moves.push({ indices: [j, j - 1], type: "comp" });
            [array[j], array[j - 1]] = [array[j - 1], array[j]];
            moves.push({ indices: [j, j - 1], type: "swap" });
            j--;
        }
        moves.push({ sortedIndex: i });
    }
    return moves;
}

function selectionSort(array) {
    const moves = [];
    for (let i = 0; i < array.length; i++) {
        let minIndex = i;
        for (let j = i + 1; j < array.length; j++) {
            moves.push({ indices: [minIndex, j], type: "comp" });
            if (array[j] < array[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex !== i) {
            [array[i], array[minIndex]] = [array[minIndex], array[i]];
            moves.push({ indices: [i, minIndex], type: "swap" });
        }
        moves.push({ sortedIndex: i });
    }
    return moves;
}

function mergeSort(array) {
    const moves = [];
    if (array.length <= 1) return moves;

    function mergeSortHelper(array, start) {
        if (array.length <= 1) return array;
        const mid = Math.floor(array.length / 2);
        const left = mergeSortHelper(array.slice(0, mid), start);
        const right = mergeSortHelper(array.slice(mid), start + mid);
        return merge(left, right, start);
    }

    function merge(left, right, start) {
        let i = 0, j = 0, k = 0;
        const result = [];
        while (i < left.length && j < right.length) {
            moves.push({ indices: [start + k, start + left.length + j], type: "comp" });
            if (left[i] < right[j]) {
                result.push(left[i]);
                moves.push({ indices: [start + k], value: left[i], type: "place" });
                i++;
            } else {
                result.push(right[j]);
                moves.push({ indices: [start + k], value: right[j], type: "place" });
                j++;
            }
            k++;
        }
        while (i < left.length) {
            result.push(left[i]);
            moves.push({ indices: [start + k], value: left[i], type: "place" });
            i++;
            k++;
        }
        while (j < right.length) {
            result.push(right[j]);
            moves.push({ indices: [start + k], value: right[j], type: "place" });
            j++;
            k++;
        }
        for (let m = 0; m < result.length; m++) {
            array[start + m] = result[m];
        }
        return result;
    }

    mergeSortHelper(array, 0);
    return moves;
}

function quickSort(array) {
    const moves = [];
    quickSortHelper(array, 0, array.length - 1, moves);
    return moves;

    function quickSortHelper(array, low, high, moves) {
        if (low < high) {
            const pivotIndex = partition(array, low, high, moves);
            currentPivotIndex = pivotIndex;
            moves.push({ index: pivotIndex, type: "pivot" });
            quickSortHelper(array, low, pivotIndex - 1, moves);
            quickSortHelper(array, pivotIndex + 1, high, moves);
        }
    }

    function partition(array, low, high, moves) {
        const pivot = array[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
            moves.push({ indices: [j, high], type: "comp" });
            if (array[j] < pivot) {
                i++;
                [array[i], array[j]] = [array[j], array[i]];
                moves.push({ indices: [i, j], type: "swap" });
            }
        }
        [array[i + 1], array[high]] = [array[high], array[i + 1]];
        moves.push({ indices: [i + 1, high], type: "swap" });
        return i + 1;
    }
}

function showBars(move, sorted = false) {
    container.innerHTML = "";
    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement("div");
        bar.style.height = array[i] * 100 + "%";
        bar.classList.add("bar");
        if (sorted || sortedIndices.has(i)) {
            bar.classList.add("sorted");
        } else if (move && move.indices && move.indices.includes(i)) {
            if (move.type === "swap") {
                bar.classList.add("swapping");
            } else if (move.type === "comp") {
                bar.classList.add("comparing");
            } else if (move.type === "place") {
                bar.classList.add("placing");
            }
        }
        if (currentPivotIndex !== null && currentPivotIndex === i) {
            bar.classList.add("pivoting");
        }
        container.appendChild(bar);
    }
}

function getDescription(sortFunction) {
    switch (sortFunction) {
        case bubbleSort:
            return "Bubble Sort: Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.\n Best: O(n), Average: O(n^2), Worst: O(n^2), Space: O(1)";
        case insertionSort:
            return "Insertion Sort: Builds the final sorted array one item at a time, inserting elements into their correct position.\n Best: O(n), Average: O(n^2), Worst: O(n^2), Space: O(1)";
        case selectionSort:
            return "Selection Sort: Repeatedly finds the minimum element from the unsorted part and puts it at the beginning.\n Best: O(n^2), Average: O(n^2), Worst: O(n^2), Space: O(1)";
        case mergeSort:
            return "Merge Sort: Repeatedly breaks the list down to smaller lists until there is only 1 element, then merges the lists.\n Best: O(n log n), Average: O(n log n), Worst: O(n log n), Space: O(n)";
        case quickSort:
            return "Quick Sort: Divides the list into smaller sub-lists based on a pivot element, then sorts the sub-lists.\n Best: O(n log n), Average: O(n log n), Worst: O(n^2), Space: O(log n)";
        default:
            return "";
    }
}

function updateAlgorithmInfo() {
    const algorithm = document.getElementById('algorithm').value;
    algorithmInfo.innerText = getDescription(getSortFunction(algorithm));
}

document.getElementById('algorithm').addEventListener('change', updateAlgorithmInfo);
