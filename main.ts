import './style.scss';
import { nanoid } from 'nanoid';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="couple-game">
  </div>
`;

type Item = {
  opened: boolean;
  value: number | string;
  color: string;
  uid: string;
};

class Couple {
  public field: Item[] = [];
  private selected: Item[] | null = [];
  private numbers = [];
  private images = [];
  private colors = ['red', 'green', 'blue', 'yellow'];
  private valueTypes: Array<string | number> = [
    ...this.numbers,
    ...this.images,
  ];
  private rows = 4;
  private columns = 4;
  private gameAppDiv: HTMLDivElement;
  private finalDiv: HTMLDivElement;
  private formDiv: HTMLDivElement;
  private cardsDiv: HTMLDivElement;

  constructor({ types }: { types?: string[] }) {
    if (types) {
      this.valueTypes.push(...types);
    }
    this.gameAppDiv = document.querySelector<HTMLDivElement>('.couple-game');
  }

  select(item: Item) {
    if (this.selected.includes(item)) return;
    item.opened = true;
    this.selected.push(item);

    const isOneUniqValue =
      new Set(this.selected.map((v) => v.value)).size === 1;
    const isPair = isOneUniqValue && this.selected.length === 2;
    const isOneCard = this.selected.length === 1;
    const isNotPair = !isOneUniqValue && this.selected.length === 2;

    if (isPair) {
      this.selected = [];
    }
    if (isNotPair) {
      setTimeout(() => {
        this.selected.forEach((card) => {
          card.opened = false;
        });
        this.selected = [];
        this.updateField();
      }, 500);
    }
  }

  updateField() {
    const cardNodes = this.cardsDiv!.children;
    for (let i = 0; i < this.field.length; i++) {
      const node = cardNodes[i];
      const card = this.field[i];
      if (card.opened) {
        node.classList.add('couple-game__card--flip');
      } else {
        node.classList.remove('couple-game__card--flip');
      }
    }
  }

  generateField() {
    let values = shuffleArray(this.valueTypes).slice(
      0,
      (this.rows * this.columns) / 2
    );
    let uniqValues = shuffleArray([...values, ...values]);

    while (this.field.length < this.rows * this.columns) {
      const uid = nanoid();
      const randomValue = uniqValues.shift()!;
      const randomColor = shuffleArray(this.colors)[0];

      const card = {
        opened: false,
        value: randomValue,
        color: randomColor,
        uid,
      };

      if (!uniqValues.includes(randomValue)) {
        const fieldCard = this.field.find((card) => card.value === randomValue);
        if (fieldCard) {
          card.color = fieldCard.color;
        }
      }

      this.field.push(card);
    }

    this.field = this.watchField(this.field, () => {
      setTimeout(() => {
        this.finish();
      }, 1000);
    });
  }

  createField() {
    this.cardsDiv.replaceChildren();
    this.cardsDiv.style.display = 'grid';
    this.cardsDiv.style.gridTemplateColumns = `repeat(${this.rows}, 1fr)`;
    this.cardsDiv.style.gridTemplateColumns = `repeat(${this.columns}, 80px)`;

    this.field.forEach((card) => {
      this.createCard(card);
    });
  }

  createCard(card: Item) {
    const cardElement = document.createElement('div');
    cardElement.innerHTML = `
    <div class="couple-game__card-inner">
      <div class="couple-game__card-back">
        <div class="container">
          <div class="oval">
            <div class="text">UNO</div>
          </div>
        </div>
      </div>
      <div class="couple-game__card-front">
        <div class="container ${card.color}">
          <div class="oval">
            <div class="value">${card.value}</div>
          </div>
          <div class="bottom-value">${card.value}</div>
          <div class="top-value">${card.value}</div>
        </div>
      </div>
    </div>`;
    cardElement.classList.add('couple-game__card');
    cardElement.addEventListener('click', () => {
      this.select(card);
      this.updateField();
    });
    this.cardsDiv.append(cardElement);
  }

  createGame() {
    if (this.gameAppDiv) {
      const final = this.createFinal();
      const form = this.createForm();
      const cards = document.createElement('div');
      cards.classList.add('couple-game__cards');

      const title = document.createElement('h1');
      title.classList.add('couple-game-title');
      title.innerText = 'CoupleGame';

      this.gameAppDiv.append(title);
      this.gameAppDiv.append(final);
      this.gameAppDiv.append(form);
      this.gameAppDiv.append(cards);

      this.finalDiv = final;
      this.formDiv = form;
      this.cardsDiv = cards;
    }
  }

  init() {
    this.createGame();
    this.formDiv.style.display = 'flex';
  }

  createFinal() {
    const finishState = document.createElement('div');
    finishState.classList.add('couple-game__finish');
    finishState.style.display = 'none';
    const title = document.createElement('h2');
    title.innerText = 'You win!';

    const restartButton = document.createElement('button');
    restartButton.innerText = 'Restart';
    restartButton.addEventListener('click', () => this.restart.call(this));

    finishState.append(restartButton);
    return finishState;
  }

  createForm() {
    const form = document.createElement('div');
    form.classList.add('couple-game__form');
    form.style.display = 'none';
    // button
    const startButton = document.createElement('button');
    startButton.id = 'couple-game-start-button';
    startButton.innerText = 'Start';
    startButton.addEventListener('click', () => this.start.call(this));
    // inputs
    const inputRows = document.createElement('input');
    const inputColumns = document.createElement('input');
    inputColumns.placeholder = 'Columns';
    inputRows.placeholder = 'Rows';
    inputRows.type = 'number';
    inputColumns.type = 'number';

    inputRows.addEventListener('input', (event) => {
      this.rows = event.target.value > 0 ? event.target.value : 1;
    });
    inputColumns.addEventListener('input', (event: InputEvent) => {
      this.columns = event.target.value > 0 ? event.target.value : 1;
    });

    form.append(inputRows);
    form.append(inputColumns);
    form.append(startButton);

    return form;
  }

  start() {
    if (!isEven(this.rows) && !isEven(this.columns)) {
      alert('One of rows and columns must be even!');
      return;
    }
    this.numbers = Array.from(
      { length: (this.columns * this.rows) / 2 },
      (_, i) => i
    );
    this.valueTypes.push(...this.numbers);
    this.generateField();
    this.createField();

    this.formDiv.style.display = 'none';
  }

  restart() {
    this.formDiv.style.display = 'flex';
    this.finalDiv.style.display = 'none';
    this.field = [];
    this.createField();
  }

  finish() {
    this.finalDiv.style.display = 'flex';
  }

  watchField(arr: Item[], onAllOpened: () => void) {
    const handler = {
      set(target: Item, property: string, value: any): boolean {
        // Set the property on the target object
        target[property as keyof Item] = value;

        // If 'opened' is changed, check if all objects have 'opened' set to true
        if (property === 'opened') {
          if (arr.every((item) => item.opened)) {
            // If all objects are opened, call the callback
            onAllOpened();
          }
        }

        // Return true to indicate success in setting the property
        return true;
      },
    };

    // Create proxies for each object in the array
    const proxiedArray = arr.map((item) => new Proxy(item, handler));

    // Return the proxied array
    return proxiedArray;
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

function isEven(num: number): boolean {
  return num % 2 === 0;
}

const couple = new Couple({});
couple.init();
