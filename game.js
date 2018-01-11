
/*
Тип игры:
AI_ONLY 	- играют только боты, все игровые поля открыты для наблюдения
HUMAN_ONLY 	- играют только люди, все игровые поля закрыты для наблюдения
ALL 		- смешанная игра, если игрок человек один его игровое поле открыто для наблюдения, если больше - все игровые поля закрыты для наблюдения
*/
var GAME_TYPE = {
    AI_ONLY:    "AI_ONLY",
    HUMAN_ONLY: "HUMAN_ONLY",
    ALL:        "ALL"
}

var SOUNDS = {
    SHUT:       "SHUT",
    RELOAD:     "RELOAD",
    WOUNDED:    "WOUNDED",
    DESTROYED:  "DESTROYED",
}

var SHIP_ORIENTATION = {
    VERTICAL:   "VERTICAL",
    HORIZONTAL: "HORIZONTAL",
}

var _newShipOrientation = SHIP_ORIENTATION.VERTICAL;

//Проигрывание звуковых эффектов
function playSound(name) {

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
    this.lost = false;
    this.ai = ai ? ai : false;

    this.render_battlefield = render_battlefield;
    this.calculate_battlefield_state = calculate_battlefield_state;

    this.ships = [];
    this.newship = [];
    this.hittings = [];

    this.battleField = [];
	//Инициализация игрового поля
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
	//Получить все корабли заданной палубности
    this.getShipsWithDimension = function(dimension) {

        var resultShips = [];
        for(var i = 0; i < self.ships.length; i++) {
            var ship = self.ships[i];
            if(ship.length == dimension)
                resultShips.push(ship);
        }
        return resultShips;
    }
	
	//Стоит ли стрелять по данной клетке
	this.needShutOnCell = function(target, row, col) {
	
		var besideCells = [];
		
		var battleField = target.battleField;
		
		var cell = battleField[row][col];
		
		if(!cell || !cell.state)
			return false;
		
		if(cell.state == CELL_STATES.PAST || 
			cell.state == CELL_STATES.WOUNDED || 
			cell.state == CELL_STATES.DESTROYED)
				return false;
		
		if(row != 0) {
			if(col != 0) 
				besideCells.push(battleField[row - 1][col - 1]);
				
			besideCells.push(battleField[row - 1][col]);
			
			if(col != 9) 
				besideCells.push(battleField[row - 1][col + 1]);
		}
		
		if(col != 0) 
			besideCells.push(battleField[row][col - 1]);
		
		if(col != 9) 
			besideCells.push(battleField[row][col + 1]);
	
		if(row != 9) {
			if(col != 0) 
				besideCells.push(battleField[row + 1][col - 1]);
				
			besideCells.push(battleField[row + 1][col]);
			
			if(col != 9) 
				besideCells.push(battleField[row + 1][col + 1]);
		}
		
		
		for(var i = 0; i < besideCells.length; i++) {
			if(besideCells[i].state == CELL_STATES.DESTROYED) {
					return false;
				}
		} 
		
		return true;
	}

	//Добавить корабль
    this.addShip = function(nomanual) {

        if(this.ships.length >= 10)
            return;

		//Проверим можно ли создать новый корабль (this.newship)
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
	
	//Добавляем выстрел по игровому полю игрока
	this.addHitting = function(row, col) {
	
		var soundName = SOUNDS.SHUT;	
	
		var exist = false;
		for(var key in this.hittings) {
			if(this.hittings[key].rowIndex == row && this.hittings[key].colIndex == col) {
				exist = true;
			}
		}
	
		if(!exist)
			this.hittings.push({
				rowIndex: row,
				colIndex: col
			});
		
		isHitting = false;
		
		for(var i = 0; i < this.ships.length; i++) {
			var ship = this.ships[i];
			
			if(ship.destroyed)
				continue;
			
			var countWoundedPoints = 0;
			
			for(var key in ship) {
				var point = ship[key];
				
				var woundedPoint = false;
				
				for(var hitKey in this.hittings) {
					var hitting = this.hittings[hitKey];
					
					if(hitting.rowIndex == point.rowIndex && hitting.colIndex == point.colIndex) {
                        woundedPoint = true;
                        ship.wounded = true;	
							
						if(hitting.rowIndex == row && hitting.colIndex == col) { 
							isHitting = true;
						}
						
						break;
					}						
                }
                
                if(point.rowIndex == row && point.colIndex == col)
					if(soundName == SOUNDS.SHUT)
                        soundName = SOUNDS.WOUNDED;	
				
				if(woundedPoint)
					countWoundedPoints++;
			}
			
			if(countWoundedPoints == ship.length) {
                ship.destroyed = true;		
                ship.wounded = false;	
				soundName = SOUNDS.DESTROYED;	
			}
		}
		
		if(!isHitting) {
			var shutter = _game.getCurrentGamer(true);
			var targets = shutter.targets;
			shutter.targets = [];
			for(var key in targets){
				if(targets[key] != this)
					shutter.targets.push(targets[key]);
			}
            
            var caption = shutter.name + " (" + shutter.targets.length + ")";
            if(shutter.targets.length == 0)
                caption = shutter.name;

			var captionNode = document.createTextNode(caption);
			while (shutter.td.firstChild) {
				shutter.td.removeChild(shutter.td.firstChild);
			}
			shutter.td.appendChild(captionNode);

			if(shutter.targets.length == 0)
			_game.render();
		}
        
        countDestroyed = 0;
        for(var key in this.ships){
            if(this.ships[key].destroyed)
                countDestroyed++;
        }

        if(countDestroyed == this.ships.length)
            this.lost = true;

		playSound(soundName);
	}

	//Клик наугад по игровому полю компьютером
    this.randomCellClick = function () {
        var row_index = Math.floor(Math.random() * 10);
        var bfRow = this.battleField[row_index];
        
        var col_index = Math.floor(Math.random() * 10);

        var bfCell = this.battleField[row_index][col_index];

        if(!bfCell || !bfCell.td || !bfCell.td.onclick)
            return;

        var td = bfCell.td.onclick(true);
    }
    
    //Выстрел компьютера
	this.aiShut = function () { 
        var self = this;
		//Стрельба происходит с интервалом
		setTimeout(function() {
			var currentGamer = _game.getCurrentGamer(true);
			if(currentGamer != self) {
				return;
			}
			
			if(self.targets.length == 0)
				return;
				
			var shut_row = -1;
			var shut_col = -1;

			var wounded_body = [];
			//Пробегаемся по всем целям, ищем раненые корабли, и выбираем их целями в первую очередь
			for(var key in self.targets) {
				var target = self.targets[key];
				for(var key_ship in target.ships) {
					var ship = target.ships[key_ship];
					if(ship.wounded && !ship.destroyed) {
						for(var p_index in ship) {
							var point = ship[p_index];
							for(var hit_key in target.hittings) {
								var hitting = target.hittings[hit_key];
								if(hitting.rowIndex == point.rowIndex && hitting.colIndex == point.colIndex) {
									wounded_body.push(point);
								}
							}
						}
					}
					
					if(wounded_body.length > 0)
						break;
				}
				
				if(wounded_body.length > 0) {
					var counter = 0;
					while(shut_row < 0 && shut_col < 0) {							
						var prevPoint;
						for(var key in wounded_body) {
							var point = wounded_body[key];
							if(wounded_body.length == 1) {
								if(Math.random() >= 0.5) {
								
									if(point.rowIndex == 0)
										shut_row = point.rowIndex + 1;	
									else if(point.rowIndex == 9)
										shut_row = point.rowIndex - 1;	
									else {
										if(Math.random() >= 0.5)
											shut_row = point.rowIndex - 1;
										else 
											shut_row = point.rowIndex + 1;		
									}
									
									shut_col = point.colIndex;
								}
								else {
								
									if(point.colIndex == 0)
										shut_col = point.colIndex + 1;	
									else if(point.colIndex == 9)
										shut_col = point.colIndex - 1;
									else {
										if(Math.random() >= 0.5)
											shut_col = point.colIndex - 1;
										else 
											shut_col = point.colIndex + 1;		
									}

									shut_row = point.rowIndex;									
								}

								break;
							}
							else {
								
								if(!prevPoint) {
									prevPoint = point;
									break;
								}
								
								//Если фигура вертикальная
								if(prevPoint.rowIndex != point.rowIndex) {
									shut_col = wounded_body[0].colIndex;
									if(wounded_body[0].rowIndex == 0)
										shut_row = wounded_body[wounded_body.length - 1].rowIndex + 1;
									else if (wounded_body[wounded_body.length - 1].rowIndex == 9)
										shut_row = wounded_body[0].rowIndex - 1;
									else {
										if(Math.random() >= 0.5)
											shut_row = wounded_body[0].rowIndex - 1;
										else
											shut_row = wounded_body[wounded_body.length - 1].rowIndex + 1;
									}
								}
								else //если горизонтальная
								{
									shut_row = wounded_body[0].rowIndex;
									if(wounded_body[0].colIndex == 0)
										shut_col = wounded_body[wounded_body.length - 1].colIndex + 1;
									else if (wounded_body[wounded_body.length - 1].colIndex == 9)
										shut_col = wounded_body[0].colIndex - 1;
									else {
										if(Math.random() >= 0.5)
											shut_col = wounded_body[0].colIndex - 1;
										else
											shut_col = wounded_body[wounded_body.length - 1].colIndex + 1;
									}
								}
							}
							prevPoint = point;
						}
						
						//Если по данной клетке уже стреляли ищем другую
						for(var key in target.hittings) {
								var hitting = target.hittings[key];
								if(hitting.rowIndex == shut_row && hitting.colIndex == shut_col) {
									shut_row = -1;
									shut_col = -1;
									break;
								}
							}
					}
				}
				
				var i = 0;
				//Выстрел наугад
				if(shut_col < 0 || shut_row < 0)
					while(true) {
						shut_row = Math.floor(Math.random() * 10);
						shut_col = Math.floor(Math.random() * 10);

						//если по клетке стрелять не стоит, по ней уже стреляли или она рядом с подбитым кораблем
						if(!self.needShutOnCell(target, shut_row, shut_col)) {
							continue;
						}
						
						//если так
						for(var key in target.hittings) {
							var hitting = target.hittings[key];
							if(hitting.rowIndex == shut_row && hitting.colIndex == shut_col)
								continue;
						}

						break;
					}
				

				var td = target.battleField[shut_row][shut_col].td;
				
				if(td && td.onclick) {
					td.onclick(true);
					if(self.targets.length > 0) {
						self.aiShut();
					}
					return;
				}
			}}, 1500);
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
	GAME_START:             "GAME_START",                //Сигнал к началу игры
	GAME_STARTED:           "GAME_STARTED",              //Идёт игра
	GAME_OVER:              "GAME_OVER"                  //Игра закончена
}

//Число игроков ботов
_game.countGamersAI = function() {
    var count = 0;
    for(var key in this.gamers){
        var gamer = this.gamers[key];
        if(gamer.ai)
            count++;
    }
    return count;
}

//Число игроков людей
_game.countGamersHuman = function() {
    var count = 0;
    for(var key in this.gamers){
        var gamer = this.gamers[key];
        if(!gamer.ai)
            count++;
    }
    return count;
}

//Добавление игрока
_game.addGamer = function (name, ai){
	var newGamer = new Gamer(name, ai);
    this.gamers.push(newGamer);
       
    if(this.gamers.length > 3) {
        _game.constructBattlefields();
        return;
    }

    _game.render();  
}	

//Игроки созданы, переходим к коструированию игровых полей
_game.constructBattlefields = function() {
    _game.state = _GAME_STATES.CONSTRUCT_BATTLEFIELD;
    isAI = false;
    isHuman = false;
    for(var key in this.gamers){
        var gamer = this.gamers;
        if(gamer.ai)
            isAI = true;
        else
            isHuman = true;
    }

	//Определяем тип игры
    if(isAI && isHuman)
        _game.type= GAME_TYPE.ALL;
    else if(isAI)
        _game.type= GAME_TYPE.AI_ONLY;
    else if(isHuman) 
        _game.type= GAME_TYPE.HUMAN_ONLY;

    _game.render();  
}


//Инициализация игры
_game.initGame = function() {

    _game.state = _GAME_STATES.INIT;
    _game.gamers = [];

    _game.currentGamer = null;

    _game.render();
}

//Текущий игрок
_game.getCurrentGamer = function(withoutUpdate) {

	if(withoutUpdate) {
		if(_game.currentUser)
			return _game.currentUser;
	}
	if(!_game.gamers || _game.gamers.length == 0)
		return;

	var retGamer = _game.gamers[0];
	var i = 0;
	while(retGamer.lost){
		var i_gamer = _game.gamers[++i];
		if(!i_gamer)
			break;
		
		retGamer = i_gamer;
	}
	
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
		
			var replaceRetGamer = false;
			for(var key in _game.gamers)
			{
				var target = _game.gamers[key];
				
				if(target.lost)
					continue;
				
				if(replaceRetGamer) {
					retGamer = target;
					playSound(SOUNDS.RELOAD);
					break;
				}
				
				if(target == _game.currentUser)
					replaceRetGamer = true;
			}
			
			var targets = [];
			for(var key in _game.gamers)
			{
				var target = _game.gamers[key];
				if(target != retGamer && !target.lost)
					targets.push(target);
			}
			
			retGamer.targets = targets;
		break;
	}

	if(_game.currentUser && _game.currentUser.td) {
		_game.currentUser.td.style.color = "black";
		retGamer.td.style.color = "red";
		var caption = retGamer.name + " (" + retGamer.targets.length + ")";
		if(retGamer.targets.length == 0)
			caption = retGamer.name;

			
		var captionNode = document.createTextNode(caption);
		while (retGamer.td.firstChild) {
			retGamer.td.removeChild(retGamer.td.firstChild);
		}
		retGamer.td.appendChild(captionNode);
	}
	
	_game.currentUser = retGamer;
		
	return retGamer;
}


//Отрисовка игры
_game.render = function(){

    if(this.state == _GAME_STATES.PREPARE_BATTLEFIELD) {
        var battlefieldPrepared = true;
        for(var i = 0; i < this.gamers.length; i++) {
            if(this.gamers[i].ships.length < 10)
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
    }
}

//Отрисовка инициализации игры
_game.render_init = function ()
{
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
	var addGamerButtonTitle = document.createTextNode("Добавить игрока");
    this.addGamerButton.appendChild(addGamerButtonTitle);
    this.addGamerButton.setAttribute('class', "btn add-user");
    initMenuContainer.appendChild(this.addGamerButton);
	this.initMenuContainer = initMenuContainer;
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
		
		for(var key in _game.gamers){
			var existingGamer = _game.gamers[key];
			if(existingGamer.name == gamername) {
				alert('Такой игрок уже есть!');
				return;
			}
		}
		
        self.nameGamerInput.value = "";
        self.addGamer(gamername);
    }

    //Кнопка добавления бота
    this.addBotButton = document.createElement("button");
	var addBotButtonTitle = document.createTextNode("Добавить игрока AI");
    this.addBotButton.appendChild(addBotButtonTitle);
    this.addBotButton.setAttribute('class', "btn add-bot");
    initMenuContainer.appendChild(this.addBotButton);
    this.addBotButton.onclick = function(){

        var botnames = ["Саша","Маша","Даша","Вася","Петя","Игорь","Макс","Таня","Ксюша","Котя","Люба","Сережа", "Питер"]

        var botname = botnames[Math.floor(Math.random() * botnames.length)] + " (AI)";

		while(true) {
			var existThisName = false;
			for(var key in _game.gamers){
				if(_game.gamers[key].name == botname)
					existThisName = true;
			}
			
			if(!existThisName)
				break;
			
			botname = botnames[Math.floor(Math.random() * botnames.length)] + " (AI)";
		}
		
		
        self.addGamer(botname, true);
    }

    //Кнопка старта игры
    this.startButton = document.createElement("button");
	var startButtonTitle = document.createTextNode("Старт");
    this.startButton.appendChild(startButtonTitle);
    this.startButton.setAttribute('class', "btn add-bot");
    initMenuContainer.appendChild(this.startButton);
    this.startButton.onclick = function(){
        if(_game.gamers.length < 2) {
            alert('Недостаточно игроков!');
            return;
        }
        else {
            _game.constructBattlefields();
        }
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
    //Создаем список добавленных игроков
    if(this.gamersList && this.gamersList.childNodes.length < this.gamers.length)
    {
        for(var i = 0; i < this.gamers.length; i++) {
            var gamer = this.gamers[i];
            var existInList = false;
            for(var j = 0; j < this.gamersList.childNodes.length; j++) {
                var gamerListItem = this.gamersList.childNodes[j];
				if(gamer.name == gamerListItem.innerText || gamer.name == gamerListItem.textContent)
                    existInList = true;
            }

            if(!existInList){
                var gamersListItem = document.createElement("li");
				var itemTitle = document.createTextNode(gamer.name);
				gamersListItem.appendChild(itemTitle);
                this.gamersList.appendChild(gamersListItem);    
            }
        }
    }
}

//Отрисовка подготовки игры к старту
_game.render_construct_battlefield = function ()
{
    var gameContent = document.getElementById("game-content");
    gameContent.innerText = "";
    
    var gameBoardTable = document.createElement("table");
    gameBoardTable.setAttribute('class', "game-board-table");
    gameContent.appendChild(gameBoardTable);

    var gameBoardTableRow = document.createElement("tr");
    gameBoardTable.appendChild(gameBoardTableRow);
    for(var i = 0; i < this.gamers.length; i++) {
        if(i == 0) {
            this.toolTD = document.createElement("td");
            this.toolTD.style.width = "100px";
            this.toolTD.setAttribute("rowspan", 2);

            this.orientButton = document.createElement("button");
			var orientButtonTitle = document.createTextNode("Повернуть");
			this.orientButton.appendChild(orientButtonTitle);
            this.orientButton.setAttribute('class', 'btn');
            var orientButton = this.orientButton;
            this.orientButton.onclick = function() {
				_newShipOrientation = _newShipOrientation == SHIP_ORIENTATION.VERTICAL ? 
					SHIP_ORIENTATION.HORIZONTAL : SHIP_ORIENTATION.VERTICAL;
            }

            this.toolTD.appendChild(this.orientButton);

            gameBoardTableRow.appendChild(this.toolTD);
        }

        var gamer = this.gamers[i];

        if(gameBoardTableRow.childNodes.length == 3 || (this.gamers.length == 3 && gameBoardTableRow.childNodes.length == 2)) {
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
        gamer.td = bfTableCell;

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

//Вычисляем состояние каждой клетки игрового поля в зависимости от расположения кораблей и попаданий по полю
var calculate_battlefield_state = function() {

    for(var row_index = 0; row_index < this.battleField.length; row_index++) {
        var bfRow = this.battleField[row_index];
        for(var col_index = 0; col_index < bfRow.length; col_index++) {
            var bfCell = bfRow[col_index];

            bfCell.state = CELL_STATES.INIT;

            for(var i = 0; i < this.ships.length; i++) {
                var ship = this.ships[i];
				var woundCount = 0;
                for(var j = 0; j < ship.length; j++) {
                    var point = ship[j];
					
                    if(point.rowIndex == row_index && point.colIndex == col_index) {
						if(ship.destroyed)
							bfCell.state = CELL_STATES.DESTROYED;
						else
							bfCell.state = CELL_STATES.SHIP;
                    }
					
                }
            }
			
            for(var i = 0; i < this.hittings.length; i++) { 
                var hitting = this.hittings[i];
                if(hitting.rowIndex == row_index && hitting.colIndex == col_index) {
                    if(bfCell.state == CELL_STATES.SHIP)
                        bfCell.state = CELL_STATES.WOUNDED;
					else if(bfCell.state != CELL_STATES.DESTROYED)
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

			if(bfCell.state != CELL_STATES.INIT)
                continue;
			

            var curCell;
            if(col_index > 0) {
                curCell = bfRow[col_index - 1];
                if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG || curCell.state == CELL_STATES.WOUNDED) {
                    bfCell.state = CELL_STATES.BESIDE;
                    continue;
                }
            }

            if(col_index < 9) {
                curCell = bfRow[col_index + 1];
                if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG || curCell.state == CELL_STATES.WOUNDED) {
                    bfCell.state = CELL_STATES.BESIDE;
                    continue;
                }
            }
            

            if(lastRow) {
                if(col_index > 0) {
                    curCell = lastRow[col_index - 1];
                    if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG || curCell.state == CELL_STATES.WOUNDED) {
                        bfCell.state = CELL_STATES.BESIDE;
                        continue;
                    }
                }

                curCell = lastRow[col_index];
                if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG || curCell.state == CELL_STATES.WOUNDED) {
                    bfCell.state = CELL_STATES.BESIDE;
                    continue;
                }

                if(col_index < 9) {
                    curCell = lastRow[col_index + 1];
                    if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG || curCell.state == CELL_STATES.WOUNDED) {
                        bfCell.state = CELL_STATES.BESIDE;
                        continue;
                    }
                }
            }

            if(nextRow) {
                if(col_index > 0) {
                    curCell = nextRow[col_index - 1];
                    if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG || curCell.state == CELL_STATES.WOUNDED) {
                        bfCell.state = CELL_STATES.BESIDE;
                        continue;
                    }
                }

                curCell = nextRow[col_index];
                if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG || curCell.state == CELL_STATES.WOUNDED) {
                    bfCell.state = CELL_STATES.BESIDE;
                    continue;
                }

                curCell = nextRow[col_index + 1];
                if(col_index < 9) {
                    if(curCell.state == CELL_STATES.SHIP || curCell.state == CELL_STATES.WRONG || curCell.state == CELL_STATES.WOUNDED) {
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


//Обновление клетки игрового поля
function updateCell(bfCell, gamer){
    if(!bfCell || !bfCell.state)
		console.error('Ошибка!');

    var countGamersHuman = _game.countGamersHuman();
    var hideShips = false;

    if(countGamersHuman > 1)
        hideShips = true;
    else if(countGamersHuman > 0 && gamer.ai)
        hideShips = true;

    if(hideShips && _game.state == _GAME_STATES.PREPARE_BATTLEFIELD && !gamer.ai && gamer == _game.getCurrentGamer(true)) {
        hideShips = false;
    }


    //if(bfCell.state != bfCell.oldState) {
        switch(bfCell.state) {
            case CELL_STATES.INIT:
                bfCell.td.setAttribute("class", "init");
                break;
            case CELL_STATES.NEW:
                bfCell.td.setAttribute("class", "new");
                break; 
            case CELL_STATES.SHIP:
                if(hideShips)
                    bfCell.td.setAttribute("class", "init");
                else
                    bfCell.td.setAttribute("class", "ship");
                break; 
            case CELL_STATES.BESIDE:
                bfCell.td.setAttribute("class", "beside");
                break; 
			case CELL_STATES.WOUNDED:
                bfCell.td.setAttribute("class", "wounded");
                break; 
			case CELL_STATES.DESTROYED:
                bfCell.td.setAttribute("class", "destroyed");
                break; 
			case CELL_STATES.PAST:
				bfCell.td.style.fontSize = "medium";
				bfCell.td.style.textAlign = "center";
				bfCell.td.innerText = '•';
                break; 
            case CELL_STATES.WRONG:
                bfCell.td.setAttribute("class", "wrong");
                break; 
            default:
                bfCell.td.setAttribute("class", "default");
                break;
        }
        bfCell.oldState = bfCell.state;
    //}
    
}

var render_battlefield = function() {
    this.calculate_battlefield_state();

    for(var row_index = 0; row_index < this.battleField.length; row_index++) {
        var bfRow = this.battleField[row_index];
        for(var col_index = 0; col_index < bfRow.length; col_index++) {
            var bfCell = bfRow[col_index];
			var cursor = "default";
			var onclick = null;
            updateCell(bfCell, this);

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
            
			var shutter = _game.getCurrentGamer(true);
			allowShut = false;
			for(var key in shutter.targets)
				if(shutter.targets[key] == gamer)
					allowShut = true;
			
            if(!this.ai)
                bfCell.td.onmouseenter = function () { 
                    if(gamer.ships.length < 10 && shipDimension > 0) {
                        gamer.newship = NewShip(this.rowIndex, this.colIndex, shipDimension, gamer.ai);
                        gamer.render_battlefield();
                    }
                }
				
            if(_game.state == _GAME_STATES.PREPARE_BATTLEFIELD) {   
                onclick = function (nomanual) { 
				
                    gamer.newship = NewShip(this.rowIndex, this.colIndex, shipDimension, gamer.ai);
                    gamer.addShip(nomanual);
                }
            }
            else if(_game.state == _GAME_STATES.GAME_START) {
				if(allowShut) {
						cursor = "crosshair";
				
						onclick = function (nomanual) { 
							
							if (typeof nomanual == 'object')
								nomanual = false;
							
							var currentGamer = _game.getCurrentGamer(true);
														
							if(currentGamer.ai && !nomanual) {
								return;
							}
							
							gamer.addHitting(this.rowIndex, this.colIndex);
							
							gamer.render_battlefield();
						}
					}
            }
            else 
            { 
				cursor = null;
                bfCell.td.onclick = null; 
            }

			if(bfCell.td.style.cursor != cursor)
				bfCell.td.style.cursor = cursor
				
			bfCell.td.onclick = onclick;
        }
    }
}


//Отрисовка подготовки игры к старту
_game.render_prepare_battlefield = function ()
{
	this.initMenuContainer.style.display = "none";

    var currentGamer = _game.getCurrentGamer();

    currentGamer.render_battlefield();
    
    var counter = 0;
    if(currentGamer.ai)
        while(true) {
            if(_game.state != _GAME_STATES.PREPARE_BATTLEFIELD)
                break;
			else {
				var newCurrentGamer = _game.getCurrentGamer();
				if(newCurrentGamer != currentGamer)
					break;
			
                currentGamer.randomCellClick();
            }
        }
}

//Отрисовка подготовки игры к старту
_game.render_game_start = function ()
{	
	this.orientButton.style.display = "none";

    var currentGamer = _game.getCurrentGamer();

    for(var key in currentGamer.targets){
        var target = currentGamer.targets[key];
        target.render_battlefield();
    }
    
    if(currentGamer.ai) {
        currentGamer.aiShut();
    }
	
	var countGamersInGame = 0;
	for(var key in _game.gamers){
		var gamer = _game.gamers[key];
		var countBattleShips = 0;
		for(var sKey in gamer.ships) {
			var ship = gamer.ships[sKey];
			if(!ship.destroyed)
				countBattleShips++;
		}
		
		if(countBattleShips > 0) 
			countGamersInGame++;
	}
	
	if(countGamersInGame < 2) {
		var winner = _game.getCurrentGamer(true);
		if(confirm('Победитель:' + winner.name + '. Начать заново?'))
			_game.initGame();
	}
}


_game.initGame();

