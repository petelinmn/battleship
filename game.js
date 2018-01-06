
var CELL_STATES = {
    INIT:   "INIT",         //Просто пустая морская клетка
    NEW:    "NEW",          //Резмещение нового корабля
    SHIP:   "SHIP",         //Корабль
    BESIDE: "BESIDE",       //Клетка рядом с кораблем
    PAST:   "PAST",         //Попадание мимо
    WOUNDED:"WOUNDED",      //Подбитый корабль
    DESTROYED: "DESTROYED"  //Уничтоженный корабль
}

function Gamer(name, ai = false) {
    this.name = name;
    
    this.ai = ai;

    this.battleField = [];
    for (var i = 0; i < 10; i++){
        var row = [];
        for (var j = 0; j < 10; j++){
            row.push({
                state: CELL_STATES.INIT
            });
        }
        this.battleField.push(row);
    }
}

//Игра!
var _game = { 

};

//Список состояний игры
var _GAME_STATES = {
    INIT: "INIT",                       //Начальное состояние работы программы
    INIT_CONTINUE: "INIT_CONTINUE",     //Выбор игроков
	START: "START",                     //Сигнал к началу игры
	GAME_STARTED: "GAME_STARTED",       //Идёт игра
	GAME_OVER: "GAME_OVER"              //Игра закончена
}

//Добавление игрока
_game.addGamer = function (name, ai = false){
	var newGamer = new Gamer(name, ai);
    this.gamers.push(newGamer);
       
    if(this.gamers.length > 3) {
        _game.state = _GAME_STATES.START;
    }

    _game.render();
}	


//Инициализация игры
_game.initGame = function() {

    _game.state = _GAME_STATES.INIT,
    _game.gamers = []

    _game.render();
}

//Старт игры
_game.startGame = function() {

    if(!_game || _game.state || _game.gamers)
    {
        console.log("Нельзя запустить игру, если она не создана!");
        return;
    }

    if(_game.gamers.length >= 2) {
        _game.state = _GAME_STATES.START;
        _game.render(); 
	}
	else {
		alert('Игроков недостаточно!');
	}
}

//Отрисовка
_game.render = function(){
    console.log(this.state);
    if(!this.state){
        console.log('Не указано состояние объекта!');
        return;
    }

    switch(this.state){
        case _GAME_STATES.INIT:
            _game.render_init();
            break;
        case _GAME_STATES.INIT_CONTINUE:
            _game.render_init_continue();
            break;
        case _GAME_STATES.START:
            _game.render_start();
            break;
        case _GAME_STATES.GAME_STARTED:
            _game.render_game_started();
            break;
        case _GAME_STATES.GAME_OVER:
            _game.render_game_over();
            break;
    }
}

//Отрисовка инициализации игры
_game.render_init = function ()
{
    console.log('render_init');
    var self = this;

    var gameContent = document.getElementById("game-content");
    gameContent.innerHTML = "";


    var initMenuContainer = document.createElement('div');
    initMenuContainer.setAttribute('id', 'init-menu');
    gameContent.appendChild(initMenuContainer);



    this.nameGamerInput = document.createElement("input");
    this.nameGamerInput.setAttribute('class', "add-user");
    initMenuContainer.appendChild(this.nameGamerInput);

    this.addGamerButton = document.createElement("button");
    this.addGamerButton.innerText = "Добавить игрока"
    this.addGamerButton.setAttribute('class', "btn add-user");
    initMenuContainer.appendChild(this.addGamerButton);
    this.addGamerButton.onclick = function() {

        if(!self.nameGamerInput) {
            alert('Не удается найти поле ввода имени игрока');
            return;
        }

        if(!self.nameGamerInput.value){
            alert('Введите имя игрока!');
            return;
        }

        var gamername = self.nameGamerInput.value;
        self.nameGamerInput.value = "";

        self.addGamer(gamername);

        
    }

    this.addBotButton = document.createElement("button");
    this.addBotButton.innerText = "Добавить игрока AI"
    this.addBotButton.setAttribute('class', "btn add-bot");
    this.addBotButton.onclick = function(){

        var botnames = ["Саша","Маша","Даша","Вася","Петя","Игорь","Макс","Таня","Ксюша","Котя","Люба"]

        var botname = botnames[Math.floor(Math.random() * botnames.length)] + " (AI)";

        self.addGamer(botname, true);
    }
    initMenuContainer.appendChild(this.addBotButton);

    //Создаем список добавленных игроков
    this.gamersList = document.createElement("ul");
    this.gamersList.setAttribute('id', "gamers-list");
    initMenuContainer.appendChild(this.gamersList);


    self.state = _GAME_STATES.INIT_CONTINUE;
}

//Отрисовка подготовки игры к старту
_game.render_init_continue = function ()
{
    console.log('render_init_continue');
    //var gameContent = document.getElementById("game-content");
    //gameContent.innerText = "init_continue";


    //Создаем список добавленных игроков

    if(this.gamersList && this.gamersList.childNodes.length < this.gamers.length)
    {
        for(var i = 0; i < this.gamers.length; i++) {
            var gamer = this.gamers[i];
            var existInList = false;
            for(var j = 0; j < this.gamersList.childNodes.length; j++) {
                var gamerListItem = this.gamersList.childNodes[j];
                if(gamer.name == gamerListItem.innerText)
                    existInList = true;
            }

            if(!existInList){
                var gamersListItem = document.createElement("li");
                gamersListItem.innerText = gamer.name;
                this.gamersList.appendChild(gamersListItem);    
            }
        }

    }
}

//Отрисовка подготовки игры к старту
_game.render_start = function ()
{
    console.log('render_start');
    var gameContent = document.getElementById("game-content");
    gameContent.innerText = "";
    
    var gameBoardTable = document.createElement("table");
    gameBoardTable.setAttribute('class', "game-board-table");
    gameContent.appendChild(gameBoardTable);

    var gameBoardTableRow = document.createElement("tr");
    gameBoardTable.appendChild(gameBoardTableRow);
    for(var i = 0; i < this.gamers.length; i++){
        var gamer = this.gamers[i];

        if(gameBoardTableRow.childNodes.length == 2 || (this.gamers.length == 3 && gameBoardTableRow.childNodes.length == 1)) {
            gameBoardTableRow = document.createElement("tr");
            gameBoardTable.appendChild(gameBoardTableRow);
        }

        var gameBoardTableCell = document.createElement("td");
        

        //create battlefield
        var bfTable = document.createElement("table");
        gameBoardTableCell.appendChild(bfTable);
        bfTable.setAttribute('class', "battlefield");

        //row with gamer's name
        var bfTableRow = document.createElement("tr");
        bfTable.appendChild(bfTableRow);
        var bfTableCell = document.createElement("th");
        bfTableRow.appendChild(bfTableCell);
        bfTableCell.setAttribute("colspan", "10");
        bfTableCell.innerText = gamer.name;

        for(var i2 = 0; i2 < gamer.battleField.length; i2++) {

            var battleFieldRow = gamer.battleField[i2];

            bfTableRow = document.createElement("tr");
            bfTable.appendChild(bfTableRow);

            for(var j2 = 0; j2 < battleFieldRow.length; j2++) {
                bfTableCell = document.createElement("td");
                bfTableCell.setAttribute("class", "init");
                bfTableRow.appendChild(bfTableCell);
            }
        }

        console.log(gamer);
        

        gameBoardTableRow.appendChild(gameBoardTableCell);
    }
}



//Отрисовка подготовки игры к старту
_game.render_game_started = function ()
{
    console.log('render_game_started');
    var gameContent = document.getElementById("game-content");
    gameContent.innerText = "started";
}

//Отрисовка подготовки игры к старту
_game.render_game_over = function ()
{
    console.log('render_game_over');
    var gameContent = document.getElementById("game-content");
    gameContent.innerText = "game_over";
}


_game.initGame();