var user_score = 0 ;
var comp_score = 0 ;
const playButton = document.getElementById("play");
const trainButton = document.getElementById("train");
const user = document.getElementById("user");;
const comp = document.getElementById("comp");
const rock_img = document.getElementById("rock");
const scissor_img = document.getElementById("scissor");
const paper_img = document.getElementById("paper");
const message_p = document.querySelector(".message");
const classifier = knnClassifier.create();
let net;
let isPlaying = false;
let isTraining = false;
let isTrained = false;
let webcam;

//-----------------------------------------------------------------------------

async function loadModel(){
	message_p.innerHTML = 'Loading the game';
	console.log('Loading mobilenet..');
	net = await mobilenet.load();
	console.log('Successfully loaded model');
	message_p.innerHTML = 'The game is loaded, now you can train the model';
}

async function cam(){
	webcam = await tf.data.webcam(document.getElementById('webcam'));
}

async function train() {

	rock_img.classList.remove('block');
	paper_img.classList.remove('block');
	scissor_img.classList.remove('block');
	message_p.innerHTML = "Training";

	rock_img.addEventListener('click', () => addExample(0));
	scissor_img.addEventListener('click', () => addExample(1));
	paper_img.addEventListener('click', () => addExample(2));


	const addExample = async classId => {
		const img = await webcam.capture();
		const activation = net.infer(img, 'conv_preds'); // conv_preds is used for getting the activation from 'net' model
		classifier.addExample(activation, classId); // adding the class with its activation, given by 'net' model
		img.dispose(); // dispose the tensor oof the memory
	};

	trainButton.innerHTML = "Done";
	if(classifier.getNumClasses() > 2){
		isTrained = true;
		rock_img.classList.add('block');
		paper_img.classList.add('block');
		scissor_img.classList.add('block');
		trainButton.innerHTML = "Train";
		message_p.innerHTML = "Model trained";
		playButton.classList.remove('block');
	}

}

async function getPrediction(){
	let result, returnValue ;
	if(isTrained){
		const img = await webcam.capture(); // img is a tensor created by webCam stream
		const activation = net.infer(img, 'conv_preds'); // getting activation for model 'net'
		result = await classifier.predictClass(activation); // prediction
		console.log(result); // result
		img.dispose();
		returnValue = result.classIndex;
	}
	await tf.nextFrame();
	return returnValue;
}

//----------------------------------------------------------------------

function getchoice() {
	list = ["paper" , "rock" , "scissor"]
	var index = Math.floor(Math.random() * 4);
	return list[index];
}

function win(user_choice, comp_choice) {
	user_score ++;
	user.innerHTML = user_score;
	message_p.innerHTML = user_choice + " beats " + comp_choice + ". You win!";
	document.getElementById(user_choice).classList.add("green");
	setTimeout(function(){document.getElementById(user_choice).classList.remove("green");}, 400)
}

function lose(user_choice, comp_choice) {
	comp_score ++;
	comp.innerHTML = comp_score;
	message_p.innerHTML = comp_choice + " beats " + user_choice + ". You loss...";
	document.getElementById(user_choice).classList.add("red");
	setTimeout(function(){document.getElementById(user_choice).classList.remove("red");}, 400)
}

function draw(choice) {
	message_p.innerHTML = choice + " is same as " + choice + ". It's a draw.";
	document.getElementById(choice).classList.add("grey");
	setTimeout(function(){document.getElementById(choice).classList.remove("grey");}, 400)	
}

async function game() {

	if(!isTrained){
		message_p.innerHTML = "Model not trained.";
		return;
	}

	
	const className = ["rock", "scissor", "paper"];
	let index = await getPrediction();
	console.log(index);
	user_choice = className[index];
	comp_choice = getchoice();

	switch(user_choice+comp_choice){
		case "rockscissor":
		case "scissorpaper":
		case "paperrock":
			win(user_choice, comp_choice);
			break;
		case "rockpaper":
		case "scissorrock":
		case "paperrock":
			lose(user_choice, comp_choice);
			break;
		case "rockrock":
		case "scissorscissor":
		case "paperpaper":
			draw(user_choice);
			break;
	}

}


function main() {
	loadModel();
	cam();
	trainButton.addEventListener('click', function(){
		train();
	} );
	playButton.addEventListener('click', function(){
		game();
	});

	if(!isTrained){
		playButton.classList.add('block');
	}
	rock_img.classList.add('block');
	paper_img.classList.add('block');
	scissor_img.classList.add('block');
	
}	
main();
