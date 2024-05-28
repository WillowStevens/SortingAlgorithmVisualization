const n = 10;
const array=[];
init();//generate first array and show the bars on program startup
function init(){
	for(let i = 0; i<n;i++){
		array[i]=Math.random();
	}
	showBars();
}
function play(){
	const copy=[...array];
	const swaps = bubbleSort(copy);
	animate(swaps);
}
function animate(swaps){
	if(swaps.length==0){
		return;
	}
	const [i,j] = swaps.shift();
	[array[i],array[j]]=[array[j],array[i]];
	showBars();
	setTimeout(function(){
		animate(swaps);
	},50);
}

//bubble sort
function bubbleSort(array)
{
	const swaps=[];
	do{
		var swapped = false;
		for(let i = 1; i<array.length;i++){
			if(array[i-1] > array[i]){
				swapped = true;
				swaps.push([i-1,i]);
				[array[i-1],array[i]]=[array[i],array[i-1]];
			}	
		}
	}while(swapped);
	return swaps;
}
function showBars(){
	container.innerHTML="";
	for(let i = 0;i<array.length;i++){
		const bar = document.createElement("div");
		bar.style.height=array[i]*100+"%";
		bar.classList.add("bar");
		container.appendChild(bar);
	}
}