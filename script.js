//import { Satellite } from './satellite.js'

const FILMOW_BASE_URL = "https://filmow.com/"
const MOVIES_NAMES_URL = "https://raw.githubusercontent.com/CristovaoBG/movieRecomendation/master/data/movieNames.txt";
const MOVIES_AND_NUMBERS_URL = "https://raw.githubusercontent.com/CristovaoBG/movieRecomendation/master/data/moviesAndNumbers.txt";
const MOVIE_RELATIONS_BASE_URL = "https://raw.githubusercontent.com/CristovaoBG/movieRecomendation/master/data/relations/mr";
const IMG_BASE_URL = "https://raw.githubusercontent.com/CristovaoBG/movieRecomendation/master/data/images/";
const MOVIES_PER_FILE = 100; //cada arquivo mrXX.txt contem 100 filmes
const IMAGES_PER_FILE = 100;
const MOVIES_TO_SHOW = 10;
const DISTANCE_FACTOR = 50;
const LINE_COLOR = "#770077";
const THICKEST_LINE = 40;
const THINNEST_LINE = 3;
const MAX_RADIUS = 75;
const MIN_RADIUS = 45;
const ONHOVER_HEIGHT = "303px"
const ONHOVER_WIDTH = "220px"
const ANGLE_SPEED_FACTOR = 0.0025;
var moviesAndNumbers = [];
var moviesNames = []
var retrivedTextBuffer;
var file;
var doneReading = false;
var satellites = [];
var satellitesArray = [];
var frontZIndex = 100;
var frameCount = 0;

var backCanvas = document.getElementById("backCanvas");

function myFunction(event) {
    if (event.keyCode === 13) {
     event.preventDefault();
     processPressed();
     return;
    }
    //se for seta nao faz nada
    if(event.keyCode >= 37 && event.keyCode <= 40){
      return;
    }

    // console.log(event)
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    ul = document.getElementById("filmList");
    li = ul.getElementsByTagName("option");

    //se o texto for vazio, nao mostra nada
    //caso contrario procura resultados na moviesAndNumbers
    //atribui cinco primeiro resultados aos li
    //remove todos os elementos existentes
    opts = ul.getElementsByTagName("option");
    while(ul.children.length){
      ul.removeChild(ul.children[0])
    }

    idResults = []
    if (filter.length != 0){
      //varre moviesAndNumbers e da push dos indices que batem
      for(let i=0;i<moviesAndNumbers.length;i++){
        //compara
        if (getMovieNameFormatted(i).toUpperCase().slice(0,filter.length) == filter){
          //adiciona indices
          idResults.push(i)
          //trunca
          if(idResults.length>6) break;
        }
      }
      //atribui resultados aos li e mostra
      for (let i = 0; i < idResults.length; i++) {
        var newOption = document.createElement("option");
        newOption.value = getMovieNameFormatted(idResults[i]);
        ul.appendChild(newOption);
      }
    }
}

function getFileFromServer(url, doneCallback) {
    var xhr;

    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handleStateChange;
    xhr.open("GET", url, true);
    xhr.send();

    function handleStateChange() {
        if (xhr.readyState === 4) {
            doneCallback(xhr.status == 200 ? xhr.responseText : null);
        }
    }
}

function getMovieIndex(movieName){
  id = -1
  for (let i=0;i<moviesAndNumbers.length;i+=1){
    currentMovie = moviesAndNumbers[i].split(" ")[0]
    if (movieName.localeCompare(currentMovie) == 0){
      id = i;
      break;
    }
  }
  return id
}

function getMovieIndexFormatted(movieName){
  id = -1
  for (let i=0;i<moviesNames.length;i+=1){
    currentMovie = moviesNames[i]
    if (movieName.localeCompare(currentMovie) == 0){
      id = i;
      break;
    }
  }
  return id
}

function getMovieName(movieId){
  return moviesAndNumbers[movieId].split(" ")[0];
}

function getMovieNameFormatted(movieId){
  return moviesNames[movieId];
}

function getMovieWheight(movieId){
  return parseInt(moviesAndNumbers[movieId].split(" ")[1].split("\r")[0])
}

function getRelationsList(movieName){
  movieId = getMovieIndexFormatted(movieName);
  if (movieId == -1){
    alert("Filme não encontrado.")
    return;
  }
  clearAllSatellites(); //limpa satelites anteriores
  fileNum = Math.floor(movieId / MOVIES_PER_FILE);
  registerPosition = movieId % MOVIES_PER_FILE;
  //GET FILE AT THE WEB
  dir = MOVIE_RELATIONS_BASE_URL+fileNum+".txt"
  getFileFromServer(dir, function(text) {
    if (text === null) /*error*/;
    else file = text;

    //END OF GETING FILE
    //convert to array
    file = file.split(" ");
    //convert to ints
    for (let i=0; i<file.length ; i++){
      file[i] = parseInt(file[i]);
    }
    //END OF FORMATING
    jumps = 0;
    offset = 0;
    while(jumps != registerPosition){
      offset+=file[offset]*2 + 1;
      jumps+=1;
    }
    registerSize = file[offset];
    offset+=1;
    register = file.slice(offset,offset+registerSize*2);
    //reconstruct file names and calculates scores
    cursor = 0;
    output = []
    while(cursor<register.length){
        // register[cursor+1] = register[cursor+1]/Math.pow(getMovieWheight(register[cursor]),0.55)
        // register[cursor] = getMovieName(register[cursor])
        output.push([register[cursor],register[cursor+1]/Math.pow(getMovieWheight(register[cursor]),0.55)])
        cursor+=2;
    }
    output.sort(function(a,b){
      return b[1]-a[1]
    })
    // console.log(output)
    strOutput = ""
    for (let i=0;i<output.length && i<30;i+=1){
      strOutput += getMovieName(output[i][0])+".      Score:"+output[i][1]+"\n";
    }
    //calcula diretorio e mostra imagem
    directoryNumber = IMAGES_PER_FILE*Math.floor(movieId / IMAGES_PER_FILE);
    planet = document.getElementById("planet")
    planet.style.background = "url("+IMG_BASE_URL+directoryNumber+"/"+movieId+".jpg)";
    planet.style.zIndex = frontZIndex;
    planet.style.visibility = "visible";

    //calcula maior e menor peso
    biggestWeight = output[0][1];
    smallestWeight = output[MOVIES_TO_SHOW-1][1]
    //cria filhos
    for(let i=0;i<MOVIES_TO_SHOW;i++){
      // createSatellite(getMovieIndex(output[i][0])/*otimizavel*/,output[i][1]);
      satellitesArray.push(new Satellite(output[i][0],output[i][1],biggestWeight,smallestWeight))
    }
    // adiciona ao array de satellites
    satellites = document.getElementsByClassName("satellite");
    // alert(strOutput)
    return(output)
  });
}

//start moviesAndNumbers
function processPressed(){
  input = document.getElementById("myInput");
  name = input.value;
  getRelationsList(name);
}

function clearAllSatellites(){
  for (let i=0; i<satellitesArray.length;i++){
    satellitesArray[i].clearSatellite();
  }
  satellitesArray=[]
}

function everyFrame(){
  //desenha background
  drawCanvasBackground();
  //add repulsao
  for(let i=0; i<satellitesArray.length; i++){
    for(let j=0; j<satellitesArray.length; j++){
      if(j==i) continue
      satellitesArray[i].addRepulsionFromSatellite(satellitesArray[j])
    }
  }
  //atualiza satellites
  for(let i=0; i<satellitesArray.length; i++){
    satellitesArray[i].step()
    satellitesArray[i].drawLine()
  }
  frameCount+=1;
}

function drawCanvasBackground(){

  width = window.innerWidth;
  height = window.innerHeight;

  backCanvas.width = width;
  backCanvas.height = height;
  var ctx = backCanvas.getContext("2d");

  // Create gradient
  var grd = ctx.createRadialGradient(width/2,height/2,0,width/2,height/2,width/2);
  redValue = 100 + 30*Math.sin(frameCount/50);
  greenValue = 100 + 54*Math.cos(frameCount/150);
  grd.addColorStop(0,"#"+Math.floor(redValue).toString(16)+"39c5");
  grd.addColorStop(1,"#ca"+Math.floor(greenValue).toString(16)+"db");
  // grd.addColorStop(0,"#3c39c5");
  // grd.addColorStop(1,"#ca29db");
  // Fill with gradient
  ctx.fillStyle = grd;
  ctx.fillRect(0,0,screen.width,screen.height);

}

setInterval(function(){
  everyFrame();
}, 15);  //~60 fps

getFileFromServer(MOVIES_AND_NUMBERS_URL, function(text) {
    if (text === null) /*error*/retrivedTextBuffer =-1;
    else moviesAndNumbers = text.split("\n").slice();
});

getFileFromServer(MOVIES_NAMES_URL, function(text) {
    if (text === null) /*error*/retrivedTextBuffer =-1;
    else moviesNames = text.split("\n").slice();
});
