
var CELL_STATES = {
    INIT:       "INIT",         //Просто пустая морская клетка
    NEW:        "NEW",          //Размещение нового корабля
    WRONG:      "WRONG",        //ошибочная клетка
    SHIP:       "SHIP",         //Корабль
    BESIDE:     "BESIDE",       //Клетка рядом с кораблем
    PAST:       "PAST",         //Попадание мимо
    WOUNDED:    "WOUNDED",      //Подбитый корабль
    DESTROYED:  "DESTROYED"     //Уничтоженный корабль
}

function Gamer(name, ai) {


    this.name = name;
    
    this.ai = ai ? ai : false;

    this.render_battlefield = render_battlefield;
    this.calculate_battlefield_state = calculate_battlefield_state;

    this.ships = [];

    this.newship = [];

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
    INIT:                   "INIT",                      //Начальное состояние работы программы
    INIT_CONTINUE:          "INIT_CONTINUE",             //Выбор игроков
    CONSTRUCT_BATTLEFIELD:  "CONSTRUCT_BATTLEFIELD",     //Построение игрового поля
    PREPARE_BATTLEFIELD:    "PREPARE_BATTLEFIELD",       //Размещение плавсредств
	GAME_START:             "GAME_START",                     //Сигнал к началу игры
	GAME_STARTED:           "GAME_STARTED",              //Идёт игра
	GAME_OVER:              "GAME_OVER"                  //Игра закончена
}

//Добавление игрока
_game.addGamer = function (name, ai){
	var newGamer = new Gamer(name, ai);
    this.gamers.push(newGamer);
       
    if(this.gamers.length > 3) {
        _game.state = _GAME_STATES.CONSTRUCT_BATTLEFIELD;
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
        _game.state = _GAME_STATES.CONSTRUCT_BATTLEFIELD;
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
        case _GAME_STATES.CONSTRUCT_BATTLEFIELD:
            _game.render_construct_battlefield();
            break;
        case _GAME_STATES.PREPARE_BATTLEFIELD:
            _game.render_prepare_battlefield();
            break;
        case _GAME_STATES.START:
            _game.render_game_start();
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

    //Кнопка добавления игрока
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

    //Кнопка добавления бота
    this.addBotButton = document.createElement("button");
    this.addBotButton.innerText = "Добавить игрока AI"
    this.addBotButton.setAttribute('class', "btn add-bot");
    initMenuContainer.appendChild(this.addBotButton);
    this.addBotButton.onclick = function(){

        var botnames = ["Саша","Маша","Даша","Вася","Петя","Игорь","Макс","Таня","Ксюша","Котя","Люба","Сережа", "Питер"]

        var botname = botnames[Math.floor(Math.random() * botnames.length)] + " (AI)";

        self.addGamer(botname, true);
    }

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
_game.render_construct_battlefield = function ()
{
    console.log('render_start');
    var gameContent = document.getElementById("game-content");
    gameContent.innerText = "";
    
    var gameBoardTable = document.createElement("table");
    gameBoardTable.setAttribute('class', "game-board-table");
    gameContent.appendChild(gameBoardTable);

    var gameBoardTableRow = document.createElement("tr");
    gameBoardTable.appendChild(gameBoardTableRow);
    for(var i = 0; i < this.gamers.length; i++) {
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

        for(var rowIndex = 0; rowIndex < gamer.battleField.length; rowIndex++) {

            var bfRow = gamer.battleField[rowIndex];

            bfTableRow = document.createElement("tr");
            bfTable.appendChild(bfTableRow);

            for(var colIndex = 0; colIndex < bfRow.length; colIndex++) {

                var bfCell = bfRow[colIndex];

                bfTableCell = document.createElement("td");
                
                bfTableRow.appendChild(bfTableCell);

                bfCell.td = bfTableCell;

                bfCell.rowIndex = rowIndex;
                bfCell.colIndex = colIndex;

                bfCell.td.rowIndex = rowIndex;
                bfCell.td.colIndex = colIndex;
            }
        }

        console.log(gamer);
        
        gameBoardTableRow.appendChild(gameBoardTableCell);
    }

    _game.state = _GAME_STATES.PREPARE_BATTLEFIELD;
    _game.render();
}


function NewShip(rowIndex, colIndex, shipDimension, VerticalOrientation) {


    var newShip = [];

    var firstPoint = {
        rowIndex: rowIndex,
        colIndex: colIndex
    }

    var shift = 0;
    if(rowIndex + shipDimension > 10)
        shift = rowIndex + shipDimension - 10;

    console.log('shift:' + shift);

    while(shift > 0) {
        console.log(rowIndex - shift)
        newShip.push({
            rowIndex: rowIndex - shift--,
            colIndex: colIndex
        });
    }
    console.log(newShip.length);
    newShip.push(firstPoint);

    while(newShip.length < shipDimension){
        newShip.push({
            rowIndex: ++rowIndex,
            colIndex: colIndex
        });
    }
    console.log(newShip);
    return newShip;
}

var calculate_battlefield_state = function() {
    for(var row_index = 0; row_index < this.battleField.length; row_index++) {
        var bfRow = this.battleField[row_index];
        for(var col_index = 0; col_index < bfRow.length; col_index++) {
            var bfCell = bfRow[col_index];

            bfCell.state = CELL_STATES.INIT;

            for(var i = 0; i < this.ships.length; i++) {
                var ship = this.ships[i];
                for(var j = 0; j < ship.length; j++) {
                    var point = ship[j];
                    if(point.rowIndex == row_index && point.colIndex == col_index) {
                        bfCell.state = CELL_STATES.SHIP;
                    }
                }
            }



            for(var i = 0; i < this.newship.length; i++) {
                if(this.newship[i].rowIndex == row_index && this.newship[i].colIndex == col_index) {
                    bfCell.state = CELL_STATES.NEW;
                }
            }

        }
    }
}


function updateCell(bfCell){
    if(!bfCell || !bfCell.state)
    console.error('Ошибка!');

    if(bfCell.state != bfCell.oldState) {
        switch(bfCell.state) {
            case CELL_STATES.INIT:
                bfCell.td.setAttribute("class", "init");
                break;
            case CELL_STATES.NEW:
                bfCell.td.setAttribute("class", "new");
                break; 
            case CELL_STATES.SHIP:
                bfCell.td.setAttribute("class", "ship");
                break; 
            default:
                bfCell.td.setAttribute("class", "default");
                break;
        }
        bfCell.oldState = bfCell.state;
    }
    
}

var render_battlefield = function() {
    console.log(this);
    this.calculate_battlefield_state();



    for(var row_index = 0; row_index < this.battleField.length; row_index++) {
        var bfRow = this.battleField[row_index];
        for(var col_index = 0; col_index < bfRow.length; col_index++) {
            var bfCell = bfRow[col_index];

            updateCell(bfCell);

            var gamer = this;
            bfCell.td.onmouseenter = function () { 
                gamer.newship = NewShip(this.rowIndex, this.colIndex, 4, true);
                gamer.render_battlefield();
            }

            bfCell.td.onclick = function () { 
                gamer.ships.push(gamer.newship);
                gamer.render_battlefield();
            }
        }
    }
}


//Отрисовка подготовки игры к старту
_game.render_prepare_battlefield = function ()
{
    console.log('render_prepare_battlefield');
    var first_gamer = _game.gamers[0];



    first_gamer.render_battlefield();
    
}

//Отрисовка подготовки игры к старту
_game.render_game_start = function ()
{
    console.log('render_game_started');
    var gameContent = document.getElementById("game-content");
    gameContent.innerText = "start";
}


//Отрисовка стартованной игры
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