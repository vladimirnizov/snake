import { Component } from '@angular/core';
import { ScoreDataService } from './score-data.service'

export const CONTROLS = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};
export const COLORS = {
  GAME_OVER: '#eb2f06',
  FOOD: '#e55039',
  HEAD: '#60a3bc',
  BODY: '#82ccdd',
  BOARD: '#b8e994'
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(document:keydown)': 'handleKeyboardEvents($event)'
  }
})
export class AppComponent {

  private interval: number;
  private tempDirection: number;
  private default_mode = 'classic';
  private isGameOver = false;

  public getKeys = Object.keys;
  public board = [];
  public score = 0;
  public gameStarted = false;
  public newBestScore = false;
  public best_score = this.snakeService.retrieve();

  private snake = {
    direction: CONTROLS.LEFT,
    parts: [
      {
        x: -1,
        y: -1
      }
    ]
  };

  private food = {
    x: -1,
    y: -1
  };

  constructor(
    private snakeService: ScoreDataService
  ) {
    this.setBoard();
  }

  handleKeyboardEvents(e: KeyboardEvent) {
    if (e.keyCode === CONTROLS.LEFT && this.snake.direction !== CONTROLS.RIGHT) {
      this.tempDirection = CONTROLS.LEFT;
    } else if (e.keyCode === CONTROLS.UP && this.snake.direction !== CONTROLS.DOWN) {
      this.tempDirection = CONTROLS.UP;
    } else if (e.keyCode === CONTROLS.RIGHT && this.snake.direction !== CONTROLS.LEFT) {
      this.tempDirection = CONTROLS.RIGHT;
    } else if (e.keyCode === CONTROLS.DOWN && this.snake.direction !== CONTROLS.UP) {
      this.tempDirection = CONTROLS.DOWN;
    }
  }

  setColors(col: number, row: number): string {
    if (this.isGameOver) {
      return COLORS.GAME_OVER;
    } else if (this.food.x === row && this.food.y === col) {
      return COLORS.FOOD;
    } else if (this.snake.parts[0].x === row && this.snake.parts[0].y === col) {
      return COLORS.HEAD;
    } else if (this.board[col][row] === true) {
      return COLORS.BODY;
    } 

    return COLORS.BOARD;
  };

  updatePositions(): void {
    let newHead = this.repositionHead();
    let me = this;

    if (this.boardCollision(newHead)) {
      return this.gameOver();

    }

    if (this.selfCollision(newHead)) {
      return this.gameOver();
    } else if (this.foodCollision(newHead)) {
      this.eatFood();
    }

    let oldTail = this.snake.parts.pop();
    this.board[oldTail.y][oldTail.x] = false;

    this.snake.parts.unshift(newHead);
    this.board[newHead.y][newHead.x] = true;

    this.snake.direction = this.tempDirection;

    setTimeout(() => {
      me.updatePositions();
    }, this.interval);
  }

  repositionHead(): any {
    let newHead = Object.assign({}, this.snake.parts[0]);

    if (this.tempDirection === CONTROLS.LEFT) {
      newHead.x -= 1;
    } else if (this.tempDirection === CONTROLS.RIGHT) {
      newHead.x += 1;
    } else if (this.tempDirection === CONTROLS.UP) {
      newHead.y -= 1;
    } else if (this.tempDirection === CONTROLS.DOWN) {
      newHead.y += 1;
    }

    return newHead;
  }



  boardCollision(part: any): boolean {
    return part.x === 20 || part.x === -1 || part.y === 20 || part.y === -1;
  }

  selfCollision(part: any): boolean {
    return this.board[part.y][part.x] === true;
  }

  foodCollision(part: any): boolean {
    return part.x === this.food.x && part.y === this.food.y;
  }

  resetFood(): void {
    let x = this.randomNumber();
    let y = this.randomNumber();

      if (this.board[y][x] === true) {
      return this.resetFood();
    }

    this.food = {
      x: x,
      y: y
    };
  }

  eatFood(): void {
    this.score++;

    let tail = Object.assign({}, this.snake.parts[this.snake.parts.length - 1]);

    this.snake.parts.push(tail);
    this.resetFood();

    if (this.score % 5 === 0) {
      this.interval -= 15;
    }
  }

  gameOver(): void {
    this.isGameOver = true;
    this.gameStarted = false;
    if (this.score > this.best_score) {
      this.snakeService.writeData(this.score);
      this.best_score = this.score;
      this.newBestScore = true;
    }

    this.setBoard();
  }

  randomNumber(): any {
    return Math.floor(Math.random() * 20);
  }

  setBoard(): void {
    this.board = [];

    for (let i = 0; i < 20; i++) {
      this.board[i] = [];
      for (let j = 0; j < 20; j++) {
        this.board[i][j] = false;
      }
    }
  }


  newGame(): void {
    this.newBestScore = false;
    this.gameStarted = true;
    this.score = 0;
    this.tempDirection = CONTROLS.LEFT;
    this.isGameOver = false;
    this.interval = 150;
    this.snake = {
      direction: CONTROLS.LEFT,
      parts: [{ x: 8, y: 8 }]
    };

    this.resetFood();
    this.updatePositions();
  }
}