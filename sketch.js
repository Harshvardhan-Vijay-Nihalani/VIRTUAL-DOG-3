var canvas;
var dog1Image;
var dog2Image;
var dog;
var count, foodS;
var life;
var database;
var button1, button2;
var lastFed, fedTime, currentTime;
var foodObj;
var changeGameState, readGameState;
var loadBedroom, loadWashroom, loadGarden;
var gameState = "";

function preload() {
	dog1Image = loadImage("images/dogImg.png");
	dog2Image = loadImage("images/dogImg1.png");
	loadBedroom = loadImage("images/Bedroom.png");
	loadWashroom = loadImage("images/Washroom.png");
	loadGarden = loadImage("images/Garden.png");
}

function setup() {
	canvas = createCanvas(800, 700);
	dog = createSprite(400, 350, 20, 30);
	dog.addImage("dog1Image", dog1Image);
	dog.addImage("dog2Image", dog2Image);
	dog.scale = 0.3;
	count = 20;
	life = 20;
	database = firebase.database();
	foodstock = database.ref('Food');
	foodstock.on("value", readstock);
	button1 = createButton('Add food');
	button2 = createButton('Feed dog');
	button1.position(840,100);
	button2.position(840,150);
	button1.mousePressed(addFood);
	button2.mousePressed(feedDog);
	foodObj = new Food();

	// read state
	readGameState=database.ref('gameState');
	readGameState.on("value", function(data){
		gameState=data.val();
	});
	fedTime = database.ref('FeedTime');
	fedTime.on("value", function(data){
		lastFed = data.val();
	});
}


function draw() {
	background(46, 139, 87);
	if(foodS === 0){
		dog.changeImage("dog1Image", dog1Image);
	}
	drawSprites();
	textSize(20);
	stroke('green');
	fill("blue");
	text("Food left = " + foodS, 20, 20);

	
	//foodObj.display();
	


	fill(255,255, 254);
	textSize(15);
	
	if(lastFed>=12){
		text("Last Fed : " + lastFed%12 + " PM", 350, 30);
	}else if(lastFed===0){
		text("Last Fed : 12 AM", 350, 30);
	}else{
		text("Last Fed : " + lastFed + "AM", 350, 30);
	}

	currentTime=hour();
	if(currentTime===(lastFed+1)){
		update("Playing");
		console.log("game state = playing");
		foodObj.garden();
	}else if(currentTime===(lastFed+2)){
		update("Sleeping");
		console.log("game state = sleeping");
		foodObj.bedroom();
	}else if(currentTime>(lastFed+2)&&currentTime<=(lastFed+4)){
		update("Bathing");
		console.log("game state = bathing");
		foodObj.washroom();
	}else{
		update("Hungry");
		console.log("game state = Hungry");
		foodObj.display();
	}


	if(gameState != "Hungry"){
		button1.hide();
		button2.hide();
		console.log("removing dog image");
		dog.remove();
	}else{
		button1.show();
		button2.show();
		console.log("Adding dog 1 image");
		dog.addImage(dog1Image);
	}


	
}

function addFood(){
	foodS++;
	database.ref('/').update({
		Food:foodS
	})
}

function feedDog(){
	dog.addImage(dog2Image);

	foodObj.updateFood(foodObj.getFoodStock()-1);
	database.ref('/').update({
		Food:foodObj.getFoodStock(),
		FeedTime: hour()
	})
}

function readstock(data){

	foodS = data.val();
	foodObj.updateFood(foodS);
}

function writeStock(x){
	if(x<=0){
		x=0;
	}else{
		x-=1;
	}
	database.ref('/').update({
		'Food':x
	})
}


function update(state){
	database.ref('/').update({
		gameState:state
	});
}