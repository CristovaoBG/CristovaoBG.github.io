class Satellite {
  constructor(movieId,weight,biggestWeight,smallestWeight) {
    //cria elemento
    var temp = document.getElementsByTagName("template")[0];
    var clon = temp.content.cloneNode(true);
    this.satellite = clon.querySelector("div")
    document.body.appendChild(clon);
    // inicializa propriedades dos satellites

    //propriedades elemento
    directoryNumber = IMAGES_PER_FILE*Math.floor(movieId / IMAGES_PER_FILE);
    this.filmowUrl = FILMOW_BASE_URL + getMovieName(movieId);
    this.satellite.style.background = "url("+IMG_BASE_URL+directoryNumber+"/"+movieId+".jpg)"
    this.satellite.style.zIndex = 0;
    this.satellite.title = getMovieNameFormatted(movieId);
    this.satellite.father = this; //meio gambiarra mas funciona
    this.satellite.backupHeight = this.satellite.style.height;
    this.satellite.backupWidth = this.satellite.style.width;
    this.satellite.backupBorderRadius = this.satellite.style.borderRadius;
    //calcula raio e largura da linha
    if (biggestWeight-smallestWeight != 0) {
      this.radius = ((weight-smallestWeight)*((MIN_RADIUS-MAX_RADIUS)/(biggestWeight-smallestWeight))+MAX_RADIUS)/2;
      // this.lineThickness = (weight-smallestWeight)*((THICKEST_LINE-1)/(biggestWeight-smallestWeight)+1);
      this.lineThickness = ((weight-smallestWeight)*((THICKEST_LINE-THINNEST_LINE)/(biggestWeight-smallestWeight))+THINNEST_LINE);

    }
    else {
      this.radius = 25;
      this.lineThickness = 3;
    }
    //atribui atributos
    this.posX = 50
    this.posY = 50
    this.offsetX = 0
    this.offsetY = 0
    this.weight = weight
    this.angle = Math.random()*2*Math.PI;  //angulo aleatorio
    this.speedBackup = ANGLE_SPEED_FACTOR*((weight*weight)/(biggestWeight*biggestWeight));
    this.angSpeed = this.speedBackup;
    this.damping = 0.5; //1 significa que nao ta atuando nada
    this.centerX = 50;
    this.centerY = 50
    this.destinX = this.centerX + Math.cos(this.angle)*this.radius;
    this.destinY = this.centerY + Math.sin(this.angle)*this.radius;

    this.satellite.onmouseenter = function(){
      //nao acredito que isso funciona mas funciona
      //"this" nesse contexto refere-se ao satellite
      this.father.angSpeed = 0;
      this.style.zIndex = frontZIndex;
      this.style.borderRadius = 0;
      this.style.height = ONHOVER_HEIGHT;
      this.style.width = ONHOVER_WIDTH;
      frontZIndex += 1;

    }
    this.satellite.onmouseleave = function(){
      this.father.angSpeed = this.father.speedBackup;
      //coloca planeta acima de si
      var planet = document.getElementById("planet");
      planet.style.zIndex = frontZIndex;
      //recupera valores do style antes do mouse ONHOVER_HEIGHT
      this.style.borderRadius = this.backupBorderRadius;
      this.style.height = this.backupHeight;
      this.style.width = this.backupWidth;
    }
    this.satellite.onmouseup = function(){
      window.open(this.father.filmowUrl);
    }
    this.apply()
  }

  setAngularSpeed(){
    this.angSpeed = 0;
  }

  //lida com os movimentos
  step(){     
    this.angle += this.angSpeed;

    this.destinX = this.centerX + Math.cos(this.angle)*this.radius;
    this.destinY = this.centerY + Math.sin(this.angle)*this.radius;
    
    // this.posX = this.destinX + this.offsetX
    // this.posY = this.destinY + this.offsetY
    

    this.posX = this.destinX
    this.posY = this.destinY

    this.apply()

    this.offsetX = 0;
    this.offSetY = 0;

  }

  // addOffset(ox,oy){
  //   this.offsetX += ox;
  //   this.offSetY += oy
  // }

  addRepulsionFromSatellite(other){
    return
    var d = (this.posX - other.posX)*(this.posX - other.posX) + (this.posY - other.posY)*(this.posY - other.posY)
    if(d>0){
      this.offsetX += (this.posX - other.posX)*10/(d);
      this.offsetY += (this.posY - other.posY)*10/(d);
    }
  }

  //atualiza na pagina
  apply(){
    this.satellite.style.left = this.posX +this.offsetX + "%"
    this.satellite.style.top = this.posY + this.offSetY + "%"
  }
  drawLine(){
    var ctx = backCanvas.getContext("2d");
    ctx.strokeStyle = LINE_COLOR;
    // draw line
    ctx.beginPath();
    ctx.moveTo(window.innerWidth/2, window.innerHeight/2);
    ctx.lineTo(window.innerWidth*this.posX/100, window.innerHeight*this.posY/100);
    ctx.lineWidth = this.lineThickness;
    ctx.stroke();
  }
  clearSatellite(){
    this.satellite.remove();
  }

}