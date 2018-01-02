
//Игра!
var _game = { 

};

//Список состояний игры
var _GAME_STATES = {
    INIT: "INIT",                       //Начальное состояние работы программы
    INIT_CONTINUE: "INIT_CONTINUE",     //Выбор игроков
	START: "START",                     //Сигнал к началу игры
	GAME_STARTED: "GAME_STARTED",         //Идёт игра
	GAME_OVER: "GAME_OVER"              //Игра закончена
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
        this.state = _GAME_STATES.START;
        _game.render(); 
	}
	else {
		alert('Игроков недостаточно!');
	}
}

//Отрисовка
_game.render = function(){

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
    var gameContent = document.getElementById("game-content");
    gameContent.innerText = "init";
}

//Отрисовка подготовки игры к старту
_game.render_init_continue = function ()
{
    var gameContent = document.getElementById("game-content");
    gameContent.innerText = "init_continue";
}

//Отрисовка подготовки игры к старту
_game.render_start = function ()
{
    var gameContent = document.getElementById("game-content");
    gameContent.innerText = "start";
}

//Отрисовка подготовки игры к старту
_game.render_game_started = function ()
{
    var gameContent = document.getElementById("game-content");
    gameContent.innerText = "started";
}

//Отрисовка подготовки игры к старту
_game.render_game_over = function ()
{
    var gameContent = document.getElementById("game-content");
    gameContent.innerText = "game_over";
}


_game.initGame();