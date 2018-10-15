import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScoreDataService {

  constructor() { }

  public writeData(score: number) {
    localStorage.setItem('snakeData', JSON.stringify({ 'best_score': score }));
  }

  public retrieve() {
    let storage = this.parse();
    if (!storage) {
      this.writeData(0);
      storage = this.parse();
    }

    return storage.best_score;
  }

  private parse() {
    return JSON.parse(localStorage.getItem('snakeData'));
  }
}
