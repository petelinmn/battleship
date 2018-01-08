
var SOUNDS = {
    SHUT: "SHUT",
    RELOAD: "RELOAD",
    WOUNDED: "WOUNDED",
    DESTROYED: "DESTROYED",
}

var SHIP_ORIENTATION = {
    VERTICAL: "VERTICAL",
    HORIZONTAL: "HORIZONTAL",
}

var _newShipOrientation = SHIP_ORIENTATION.VERTICAL;

//Проигрывание звуковых эффектов
function playSound(name) {

    return;

    if(!name)
        return;

    if(msie && msie < 9)
        return;

    if(typeof Audio !== 'function')
        return;

    var filename;

    var audio;
    switch(name)
    {
        case SOUNDS.SHUT:
            audio = new Audio('sound/shut.mp3');
            break;
        case SOUNDS.RELOAD:
            audio = new Audio('sound/reload.mp3');
            break;
        case SOUNDS.WOUNDED:
            audio = new Audio('sound/wounded.mp3');
            break;
        case SOUNDS.DESTROYED:
            audio = new Audio('sound/destroyed.mp3');
            break;
    }
    
    if(audio)
        audio.play();
}


var CELL_STATES = {
    INIT:       "INIT",         //Просто пустая морская клетка
    NEW:        "NEW",          //Размещение нового корабля
    WRONG:      "WRONG",        //Ошибочная клетка
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

    this.hittings = [];

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

    var self = this;
    this.getShipsWithDimension = function(dimension) {

        var resultShips = [];
        for(var i = 0; i < self.ships.length; i++) {
            var ship = self.ships[i];
            if(ship.length == dimension)
                resultShips.push(ship);
        }
        return resultShips;
    }

    this.addShip = function(nomanual) {

        if(this.ships.length >= 10)
            return;

        for(var row_index = 0; row_index < this.battleField.length; row_index++) {
            var bfRow = this.battleField[row_index];
            for(var col_index = 0; col_index < bfRow.length; col_index++) {
                var bfCell = bfRow[col_index]; 

                if(bfCell.state == CELL_STATES.SHIP || bfCell.state == CELL_STATES.BESIDE || bfCell.state == CELL_STATES.WRONG) {
                    for(var i = 0; i < self.newship.length; i++) {
                        var partShip = self.newship[i];
                        if (partShip.colIndex == col_index && partShip.rowIndex == row_index)
                            return false;
                    }
                }
            }
        }

        self.ships.push(self.newship);
        self.newship = [];

        if(nomanual)
            self.render_battlefield();

        if(self.ships.length == 10)
            _game.render();

        return true;
    }


    this.randomCellClick = function () {
        console.log('randomCellClick');
        var row_index = Math.floor(Math.random() * 9);
        var bfRow = this.battleField[row_index];
        
        var col_index = Math.floor(Math.random() * 9);

        var bfCell = this.battleField[row_index][col_index];

        if(!bfCell || !bfCell.td || !bfCell.td.onclick)
            return;

        var td = bfCell.td.onclick(true);
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

    _game.currentGamer = null;

    _game.render();

    _game.getCurrentGamer = function() {

        if(!_game.gamers || _game.gamers.length == 0)
            return;

        var retGamer = _game.gamers[0];
        
        
        switch(_game.state) {
            case _GAME_STATES.PREPARE_BATTLEFIELD:
                for(var i = 0; i < _game.gamers.length; i++) {
                    var gamer = _game.gamers[i];
                    if(gamer.ships.length < 10) {
                        return gamer;
                    }
                }                    
            break;
            case _GAME_STATES.GAME_START:
                retGamer.targets = [];
                for(var key in _game.gamers)
                {
                    var target = _game.gamers[key];
                    if(target != retGamer)
                        retGamer.targets.push(target);
                }
            break;
        }

            
        return retGamer;
    }
}

//Старт игры
_game.startGame = function() {

    
}

//Отрисовка
_game.render = function(){
    if(!this.state){
        console.log('Не указано состояние объекта!');
        return;
    }

    if(this.state == _GAME_STATES.PREPARE_BATTLEFIELD) {
        var battlefieldPrepared = true;
        for(var key in this.gamers) {
            if(this.gamers[key].ships.length < 10)
                battlefieldPrepared = false;
        }

        if(battlefieldPrepared)
            this.state = _GAME_STATES.GAME_START;
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
        case _GAME_STATES.GAME_START:
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
        
        gameBoardTableRow.appendChild(gameBoardTableCell);
    }

    _game.state = _GAME_STATES.PREPARE_BATTLEFIELD;
    _game.render();
}


//Новый корабль
function NewShip(rowIndex, colIndex, shipDimension, ai) {
    var newShip = [];

    var firstPoint = {
        rowIndex: rowIndex,
        colIndex: colIndex
    }
    
    var vOrientation = _newShipOrientation == SHIP_ORIENTATION.VERTICAL;
    if(ai) {
        var rand = Math.random();
        vOrientation = rand < 0.5;
    }

    var shift = 0;
    var index = vOrientation ? rowIndex : colIndex;
    if(index + shipDimension > 10)
        shift = index + shipDimension - 10;

    while(shift > 0) {
        newShip.push({
            rowIndex: vOrientation ? rowIndex - shift-- : rowIndex,
            colIndex: vOrientation ? colIndex : colIndex - shift--
        });
    }
    
    newShip.push(firstPoint);

    while(newShip.length < shipDimension){
        newShip.push({
            rowIndex: vOrientation ? ++rowIndex : rowIndex,
            colIndex: vOrientation ? colIndex : ++colIndex
        });
    }
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

            for(var i = 0; i < this.hittings.length; i++) { 
                var hitting = this.hittings[i];
                if(hitting.rowIndex == row_index && hitting.colIndex == col_index) {
                    if(bfCell.state == CELL_STATES.SHIP)
                        bfCell.state = CELL_STATES.WOUNDED;
                    else
                        bfCell.state = CELL_STATES.PAST;
                }
            }
        }
    }


    for(var row_index = 0; row_index < this.battleField.length; row_index++) {
        var bfRow = this.battleField[row_index];

        var lastRow;
        if(row_index > 0)
            lastRow = this.battleField[row_index - 1];
        
        var nextRow;
        if(row_index < 9)
            nextRow = this.battleField[row_index + 1];

        for(var col_index = 0; col_index < bfRow.length; col_index++) {
            var bfCell = bfRow[col_index];

            if(bfCell.state == CELL_STATES.WRONG)
                continue;

            if(bfCell.state == CELL_STATES.SHIP)
                continue;

            var curCell;
            if(col_index > 0) {
                curCell = bfRow[col_index - 1];
                if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG) {
                    bfCell.state = CELL_STATES.BESIDE;
                    continue;
                }
            }

            if(col_index < 9) {
                curCell = bfRow[col_index + 1];
                if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG) {
                    bfCell.state = CELL_STATES.BESIDE;
                    continue;
                }
            }
            

            if(lastRow) {
                if(col_index > 0) {
                    curCell = lastRow[col_index - 1];
                    if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG) {
                        bfCell.state = CELL_STATES.BESIDE;
                        continue;
                    }
                }

                curCell = lastRow[col_index];
                if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG) {
                    bfCell.state = CELL_STATES.BESIDE;
                    continue;
                }

                if(col_index < 9) {
                    curCell = lastRow[col_index + 1];
                    if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG) {
                        bfCell.state = CELL_STATES.BESIDE;
                        continue;
                    }
                }
            }

            if(nextRow) {
                if(col_index > 0) {
                    curCell = nextRow[col_index - 1];
                    if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG) {
                        bfCell.state = CELL_STATES.BESIDE;
                        continue;
                    }
                }

                curCell = nextRow[col_index];
                if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG) {
                    bfCell.state = CELL_STATES.BESIDE;
                    continue;
                }

                curCell = nextRow[col_index + 1];
                if(col_index < 9) {
                    if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG) {
                        bfCell.state = CELL_STATES.BESIDE;
                        continue;
                    }
                }
            }
        }
    }

    if(_game.state == _GAME_STATES.PREPARE_BATTLEFIELD)
        for(var row_index = 0; row_index < this.battleField.length; row_index++) {
            var bfRow = this.battleField[row_index];
            for(var col_index = 0; col_index < bfRow.length; col_index++) {
                var bfCell = bfRow[col_index];

                for(var i = 0; i < this.newship.length; i++) {
                    if(this.newship[i].rowIndex == row_index && this.newship[i].colIndex == col_index) {
                        if(bfCell.state == CELL_STATES.SHIP || bfCell.state == CELL_STATES.BESIDE) {
                            bfCell.state = CELL_STATES.WRONG;
                        }
                        else
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
            case CELL_STATES.BESIDE:
                bfCell.td.setAttribute("class", "beside");
                break; 
            case CELL_STATES.WRONG:
                bfCell.td.setAttribute("class", "wrong");
                break; 
            default:
                bfCell.td.setAttribute("class", "default");
                break;
        }
        bfCell.oldState = bfCell.state;
    }
    
}

var render_battlefield = function() {

    this.calculate_battlefield_state();



    for(var row_index = 0; row_index < this.battleField.length; row_index++) {
        var bfRow = this.battleField[row_index];
        for(var col_index = 0; col_index < bfRow.length; col_index++) {
            var bfCell = bfRow[col_index];

            updateCell(bfCell);

            var gamer = this;

            var shipDimension = 4
            var shipsDim = gamer.getShipsWithDimension(shipDimension);
            if(shipsDim.length > 0)
                shipDimension = 3;
            
            shipsDim = gamer.getShipsWithDimension(shipDimension);
            if(shipsDim.length > 1)
                shipDimension = 2;

            shipsDim = gamer.getShipsWithDimension(shipDimension);
            if(shipsDim.length > 2)
                shipDimension = 1;

            shipsDim = gamer.getShipsWithDimension(shipDimension);
            if(shipsDim.length > 3)
                shipDimension = -1;
            
            if(!this.ai)
                bfCell.td.onmouseenter = function () { 
                    if(gamer.ships.length < 10 && shipDimension > 0) {
                        gamer.newship = NewShip(this.rowIndex, this.colIndex, shipDimension, gamer.ai);
                        gamer.render_battlefield();
                    }
                }
                console.log(_game.state);
            if(_game.state == _GAME_STATES.PREPARE_BATTLEFIELD) {   
                bfCell.td.onclick = function (nomanual) { 
                    gamer.newship = NewShip(this.rowIndex, this.colIndex, shipDimension, gamer.ai);
                    gamer.addShip(nomanual);
                }
            }
            else if(_game.state == _GAME_STATES.GAME_START) {
                console.log('set onclick start');
                bfCell.td.onclick = function (nomanual) { 

                    //if(nomanual)
                    //    return;

                    console.log('hitting');
                    gamer.hittings.push({
                        rowIndex: this.rowIndex,
                        colIndex: this.colIndex
                    })

                    console.log(gamer.hittings);
                }
            }
        }
    }
}


//Отрисовка подготовки игры к старту
_game.render_prepare_battlefield = function ()
{
    console.log('render_prepare_battlefield');
    var currentGamer = _game.getCurrentGamer();

    currentGamer.render_battlefield();
    var i = 0;

    if(currentGamer.ai)
        while(true) {

            if(currentGamer.ships == 10)
                break;

            if(++i > 200){
                console.log('too long!!!');
                break;
            }

            //if(!((currentGamer.ships < 10 || ++i < 300)))
            //    break;

            if(_game.state != _GAME_STATES.PREPARE_BATTLEFIELD)
                break;

            setTimeout(function() {
                currentGamer.randomCellClick();
            }, 1)

        }

    console.log(currentGamer);
}

//Отрисовка подготовки игры к старту
_game.render_game_start = function ()
{
    console.log('render_game_start');

    var currentGamer = _game.getCurrentGamer();

    //currentGamer.render_battlefield();

    for(var key in currentGamer.targets){
        var target = currentGamer.targets[key];
        target.render_battlefield();
    }
/*
    var i = 0;

    while(true) {

        if(!(currentGamer.ai && currentGamer.targets.length > 0 && ++i < 30))
            break;

        setTimeout(function() {
            currentGamer.randomCellClick();
        }, 1)

    }*/
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

