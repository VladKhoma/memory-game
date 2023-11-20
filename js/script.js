class Card {
  constructor(value) {
    this.value = value;
  }

  create() {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.cardNumber = this.value;
    card.innerHTML = `
    <div class="front">
      <snap class="card__text">?</snap>
    </div>
    <div class="back">
      <span class="card__text">${this.value}</span>
    </div>`;
    card.addEventListener('click', () => this.flipCard(card));
    return card;
  }

  flipCard(card) {
    if (card.dataset.matched || card.dataset.flipped || card.dataset.disabled) return;

    card.dataset.flipped = 'true';

    anime({
      easing: 'easeInOutSine',
      duration: 400,
      targets: card,
      rotateY: {value: '+=180', delay: 200},
    });

  }

}

class Grid {
  constructor(width, height, numCols, numRows) {
    this.width = width;
    this.height = height;
    this.numCols = numCols;
    this.numRows = numRows;
    this.moves = 0;
    this.score = 0;
    this.matchedCards = 0;
    this.grid = [];


    this.disabled = false

    this.getHTML();
    this.clearLogs();
    this.createGrid();
    this.events();
  }

  getHTML() {
    const gridContainer = document.querySelector('.grid__container');
    const moves = document.querySelector('#moves');
    const score = document.querySelector('#score');
    const restartButton = document.querySelector('#restart__button');
    const exitButton = document.querySelector('#exit__button');

    this.htmlElements = {
      gridContainer: gridContainer, moves: moves, score: score, restartButton: restartButton, exitButton: exitButton
    };
  }

  clearLogs() {
    this.moves = 0;
    this.score = 0;
  }

  createGrid() {
    const {gridContainer} = this.htmlElements;

    const generatedNumber = generateValue(this.numCols * this.numRows / 2);
    const cardElements = Array.from({length: this.numCols * this.numRows}, (_, index) => new Card(generatedNumber[index]).create());

    gridContainer.style.gridTemplate = `repeat(${this.numRows}, ${this.height}px) / repeat(${this.numCols}, ${this.width}px)`;
    cardElements.forEach((card, index) => {
      this.grid.push(card);
      gridContainer.appendChild(card);
    });
    this.animateShowAll();
  }

  events() {
    const {moves, score, restartButton, exitButton} = this.htmlElements;

    document.addEventListener('click', (e) => {

      const flippedCards = this.grid.filter(card => card.dataset.flipped && !card.dataset.matched);


      if (flippedCards.length === 2) {
        const [card1, card2] = flippedCards;
        if (card1.dataset.cardNumber === card2.dataset.cardNumber) {
          this.disabled = true

          flippedCards.forEach(card => card.dataset.matched = 'true');
          setTimeout(() => flippedCards.forEach(card => this.animateMatch(card, flippedCards)), 600);

          this.moves += 1;
          this.score += 5;
          this.matchedCards += 1;

          if (this.matchedCards === this.grid.length / 2) {
            restartButton.setAttribute('disabled', '')
            exitButton.setAttribute('disabled', '')
            setTimeout(() => document.dispatchEvent(new Event('victory')), 600);
          }

        } else {
          flippedCards.forEach(card => card.dataset.disabled = 'true');
          this.moves += 1;
          setTimeout(() => flippedCards.forEach(card => {
            delete card.dataset.flipped;
            delete card.dataset.disabled;
            this.animateMismatch(card);
          }), 600);
        }
      }

      moves.innerHTML = this.moves;
      score.innerHTML = this.score;

    });

  }

  animateMatch(card, flippedCards) {

    flippedCards.find(el=> (el.dataset.disabled = 'true'))
    anime.timeline({
      easing: 'easeInOutSine', duration: 400,
    }).add({
      targets: card, scale: [{value: 1.1}, {value: 1}],
      complete: () => {
        flippedCards.forEach(el=> (delete el.dataset.disabled))
      }
    });
  }

  animateShowAll() {
    this.grid.forEach(el=> (el.dataset.disabled = 'true'))
    anime.timeline({
      easing: 'easeInOutSine', duration: 400,
    }).add({
      targets: '.card', rotateY: {value: '+=180', delay: 200},
    }).add({
      targets: '.card', rotateY: {value: '-=180', delay: 200},
      complete: () => {
        this.grid.forEach(el=> (delete el.dataset.disabled))
      }
    });

  }

  animateMismatch(card) {
    anime.timeline({
      easing: 'easeInOutSine', duration: 400,
    }).add({
      targets: card, translateX: [{
        value: -5, duration: 50, easing: 'easeInOutSine',
      }, {value: 5, duration: 50, easing: 'easeInOutSine'}, {
        value: -5, duration: 50, easing: 'easeInOutSine',
      }, {value: 5, duration: 50, easing: 'easeInOutSine'}, {
        value: -2.5, duration: 50, easing: 'easeInOutSine',
      }, {value: 2.5, duration: 50, easing: 'easeInOutSine'}, {
        value: -2.5, duration: 50, easing: 'easeInOutSine',
      }, {value: 2.5, duration: 50, easing: 'easeInOutSine'}, {
        value: 0, duration: 50, easing: 'easeInOutSine',
      }],
    }).add({
      targets: card, rotateY: {value: '-=180', delay: 200},
    });
  }

  clearGrid() {
    const {gridContainer} = this.htmlElements;
    this.grid = [];
    gridContainer.innerHTML = '';
  }

}

class Timer {
  timeLimit;
  timeLeft;
  pause = false;

  constructor(timeLimit) {

    this.timeLimit = timeLimit;
    this.timeLeft = timeLimit;
    this.timerIntervalId = null;
    this.pause = false;

    this.getHTML();
    this.startTimer();
    this.handleAutoPause();
  }


  getHTML() {
    const timer = document.querySelector('#timer');
    const gameZone = document.querySelector('.game__container');
    this.htmlObjects = {
      timer: timer, gameZone: gameZone,
    };
  }

  startTimer() {
    const {timer} = this.htmlObjects;
    timer.innerHTML = this.timeLeft;
    this.timerIntervalId = setInterval(() => {
      if (this.timeLeft > 0) {
        if (!this.pause) {
          this.timeLeft--;
        }
      } else {
        this.handleTimeout();
      }
      timer.innerHTML = this.timeLeft;
    }, 1000);
  }

  handleTimeout() {
    const {timer} = this.htmlObjects;
    this.removeTimer();
    timer.innerHTML = '';
    setTimeout(() => document.dispatchEvent(new Event('timeout')), 600);
  }

  handleAutoPause() {
    const {gameZone} = this.htmlObjects;
    gameZone.addEventListener('mouseout', () => this.pause = true);
    gameZone.addEventListener('mouseover', () => this.pause = false);
  }

  stopTimer() {
    clearInterval(this.timerIntervalId);
    this.pause = true;
  }

  removeTimer() {
    this.timeLeft = this.timeLimit;
    clearInterval(this.timerIntervalId);
    this.pause = true;
  }

  resetTimer() {
    const {timer} = this.htmlObjects;
    this.timeLeft = this.timeLimit;
    timer.innerHTML = this.timeLeft;
    this.pause = false;
  }


}

class MatchGridSettings {

  constructor(currentGame) {
    this.htmlElements = {};
    this.currentGame = currentGame;

    this.getHtml();
    this.events();

  }

  getHtml() {
    const settingsButton = document.querySelector('#settings__button');
    const settingsContainer = document.querySelector('.settings');
    const closeSettingsButton = document.querySelector('#close__settings');
    const cardWidthInput = document.querySelector('#card__width');
    const cardHeightInput = document.querySelector('#card__height');
    const rowsInput = document.querySelector('#rows');
    const columnsInput = document.querySelector('#columns');
    const timeLimitInput = document.querySelector('#time__limit');
    const cardWidthLabel = document.querySelector('label[for="card__width"]');
    const cardHeightLabel = document.querySelector('label[for="card__height"]');
    const rowsLabel = document.querySelector('label[for="rows"]');
    const columnsLabel = document.querySelector('label[for="columns"]');
    const timeLimitLabel = document.querySelector('label[for="time__limit"]');
    const inputSwitch = document.querySelector('.switch');

    this.htmlElements = {
      settingsContainer: settingsContainer,
      settingsButton: settingsButton,
      closeSettingsButton: closeSettingsButton,
      cardWidthInput: cardWidthInput,
      cardHeightInput: cardHeightInput,
      rowsInput: rowsInput,
      columnsInput: columnsInput,
      timeLimitInput: timeLimitInput,
      cardWidthLabel: cardWidthLabel,
      cardHeightLabel: cardHeightLabel,
      rowsLabel: rowsLabel,
      columnsLabel: columnsLabel,
      timeLimitLabel: timeLimitLabel,
      inputSwitch: inputSwitch,
    };
  }

  events() {
    const {
      settingsButton,
      settingsContainer,
      closeSettingsButton,
      cardHeightInput,
      cardWidthInput,
      columnsInput,
      rowsInput,
      timeLimitInput,
      cardHeightLabel,
      cardWidthLabel,
      timeLimitLabel,
      columnsLabel,
      rowsLabel,
      inputSwitch,
    } = this.htmlElements;

    cardHeightInput.addEventListener('input', (e) => {
      cardHeightLabel.innerHTML = `Cards height - ${e.target.value}px`;
      this.currentGame.height = e.target.value;
    });
    cardWidthInput.addEventListener('input', (e) => {
      cardWidthLabel.innerHTML = `Cards width - ${e.target.value}px`;
      this.currentGame.width = e.target.value;
    });
    columnsInput.addEventListener('change', (e) => {
      columnsLabel.innerHTML = `Columns - ${e.target.value}`;
      this.currentGame.numCols = e.target.value;
      this.validate()

    });
    rowsInput.addEventListener('change', (e) => {
      rowsLabel.innerHTML = `Rows - ${e.target.value}`;
      this.currentGame.numRows = e.target.value;

      this.validate()
    });
    timeLimitInput.addEventListener('input', (e) => {
      timeLimitLabel.innerHTML = `Time limit - ${e.target.value}s`;
      this.currentGame.timeLimit = e.target.value;


    });
    inputSwitch.addEventListener('change', (e) => {
      if (e.target.checked) {
        this.currentGame.theme = 'dark';
        document.dispatchEvent(new Event('theme'));
      } else {
        this.currentGame.theme = 'light';
        document.dispatchEvent(new Event('theme'));

      }
    });

    closeSettingsButton.addEventListener('click', () => {
      hideDOMElements([settingsContainer]);
    });

    settingsButton.addEventListener('click', () => {
      showDOMElements([settingsContainer]);
    });
  }

  validate() {
    const {closeSettingsButton, rowsLabel, columnsLabel, settingsContainer} = this.htmlElements

    const isEven = (this.currentGame.numCols * this.currentGame.numRows)% 2 === 0;
    if (!isEven) {
      closeSettingsButton.setAttribute("disabled", 'true');
      rowsLabel.classList.add('error')
      columnsLabel.classList.add('error')
      settingsContainer.classList.add('settings__modal__error')
    } else {
      closeSettingsButton.removeAttribute("disabled");
      rowsLabel.classList.remove('error')
      columnsLabel.classList.remove('error')
      settingsContainer.classList.remove('settings__modal__error')

    }

  }


}

class MatchGrid {
  currentGrid;

  constructor({
    width, height, numCols, numRows, timeLimit, theme,
  }) {
    this.width = width;
    this.height = height;
    this.numCols = numCols;
    this.numRows = numRows;
    this.timeLimit = timeLimit;
    this.theme = theme;
    this.htmlElements = null;

    this.getHTML();
    this.setTheme(this.theme);
    this.events();
  }

  getHTML() {
    const startButton = document.querySelector('#start__button');
    const exitButton = document.querySelector('#exit__button');
    const exitToMenuButton = document.querySelector('#exit__to__menu_button');
    const playAgainButton = document.querySelector('#play__again__button');
    const restartButton = document.querySelector('#restart__button');
    const menuContainer = document.querySelector('.menu__container');
    const settingsButton = document.querySelector('#settings__button');
    const gameContainer = document.querySelector('.game__container');
    const modalContainer = document.querySelector('.modal');
    const modalText = document.querySelector('.modal__text');
    const modalTitle = document.querySelector('.modal__title');
    const themeLink = document.querySelector('#theme__link');
    const themeMode = document.querySelector('.theme__mode');

    this.htmlElements = {
      startButton: startButton,
      menuContainer: menuContainer,
      settingsButton: settingsButton,
      gameContainer: gameContainer,
      restartButton: restartButton,
      exitButton: exitButton,
      exitToMenuButton: exitToMenuButton,
      modalContainer: modalContainer,
      modalText: modalText,
      modalTitle: modalTitle,
      playAgainButton: playAgainButton,
      themeLink: themeLink,
      themeMode: themeMode,
    };
  }

  events() {
    const {
      startButton,
      exitButton,
      restartButton,
      exitToMenuButton,
      playAgainButton,
      modalContainer,
    } = this.htmlElements;

    document.addEventListener('timeout', () => {
      this.showGameOverModal(false);
    });
    document.addEventListener('victory', () => {
      this.gameTimer.stopTimer();
      this.showGameOverModal(true);
    });
    document.addEventListener('theme', () => this.setTheme(this.theme));

    startButton.addEventListener('click', () => this.startGame());
    restartButton.addEventListener('click', () => this.restartGame());
    exitButton.addEventListener('click', () => this.exitGame());
    exitToMenuButton.addEventListener('click', () => this.exitToMenu());
    playAgainButton.addEventListener('click', () => {
      hideDOMElements([modalContainer]);
      exitButton.removeAttribute('disabled')
      restartButton.removeAttribute('disabled')
      this.restartGame();
      this.gameTimer.timeLeft = this.gameTimer.timeLimit;
      this.gameTimer.startTimer();
    });


  }

  setTheme(theme) {
    const {themeLink, themeMode} = this.htmlElements;
    switch (theme) {
      case 'light': {
        themeLink.href = 'css/themes/light.css';
        themeMode.innerHTML = `${theme} theme`;
        break;
      }
      case 'dark': {
        themeLink.href = 'css/themes/dark.css';
        themeMode.innerHTML = `${theme} theme`;
        break;
      }
      default:
        break;
    }

  }


  startGame() {
    const {menuContainer, gameContainer} = this.htmlElements;

    hideDOMElements([menuContainer]);
    showDOMElements([gameContainer]);

    this.currentGrid = new Grid(this.width, this.height, this.numCols, this.numRows);

    this.gameTimer = new Timer(this.timeLimit);

  }


  exitGame() {
    const {menuContainer, gameContainer} = this.htmlElements;
    showDOMElements([menuContainer]);
    hideDOMElements([gameContainer]);
    this.currentGrid.clearGrid();
    this.gameTimer.removeTimer();

  }

  exitToMenu() {
    const {menuContainer, gameContainer, modalContainer, exitButton, restartButton} = this.htmlElements;
    exitButton.removeAttribute('disabled')
    restartButton.removeAttribute('disabled')
    hideDOMElements([gameContainer, modalContainer]);
    showDOMElements([menuContainer]);
    this.currentGrid.clearGrid();
    this.gameTimer.removeTimer();
  }

  restartGame() {
    this.currentGrid.matchedCards = 0;
    this.currentGrid.clearLogs();
    this.currentGrid.clearGrid();
    this.currentGrid.createGrid();
    this.gameTimer.resetTimer();
  }


  showGameOverModal(isVictory) {
    const {
      modalTitle, modalText, playAgainButton, modalContainer,
    } = this.htmlElements;

    if (isVictory) {
      modalTitle.innerHTML = 'You won!';
      modalText.innerHTML = 'You can play again or exit and change game settings';
      playAgainButton.innerHTML = 'play again';
    } else {
      modalTitle.innerHTML = 'Game Over';
      modalText.innerHTML = 'You can try again or exit and change game settings';
      playAgainButton.innerHTML = 'try again';
    }


    showDOMElements([modalContainer]);
  }
}


window.addEventListener('DOMContentLoaded', () => {
  const defaultSettings = {
    width: 50,
    height: 50,
    numCols: 2,
    numRows: 2,
    timeLimit: 60,
    theme: 'light',
  };
  const matchGrid = new MatchGrid(defaultSettings);
  const matchGridSettings = new MatchGridSettings(matchGrid);
});




