
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GameFinished'
}


const symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

const view = {
  //取撲克牌正面元素
  getCardContent (index) {
    const number = this.transformNumbers((index % 13) + 1)
    const symbol = symbols[Math.floor(index / 13)]

    return `
    <p>${number}</p>
    <img src="${symbol}">
    <p>${number}</p>
    `
  },

  //取撲克牌背面元素
  getCardElement (index) {
    return `<div class="card back" data-index=${index}></div>`
  },

  //撲克牌A, J, Q, K顯示轉換
  transformNumbers (number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  //顯示發牌後畫面
  displayCard (arr) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = arr.map(item => this.getCardElement(item)).join('')
  },

  //點擊顯示翻牌畫面 (...event.target)
  flipCards (...cards) {
    cards.map((card) =>{
      //點擊為背面，回傳正面
      if(card.classList.contains('back')){
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        card.classList.remove('back')
        return
      }
      //點擊為正面，回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  //配對成功卡片樣式
  pairCards (...cards) {
    cards.map((card) =>{
      card.classList.add('paired')
    })
  },

  //顯示分數
  renderScore (score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  //顯示次數
  renderTriedTimes (times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  //顯示配對錯誤動畫
  appendWrongAnimation (...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => {
        event.target.classList.remove('wrong')
      },{
        once: true
      })
    })
  },

  //顯示遊戲完成畫面
  showGameComplete () {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <h2>Completed!</h2>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
      `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const model = {
  revealedCards: [], //暫存已翻的卡牌
  score: 0,
  triedTimes: 0,

  isRevealedCardMatched () {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  //發牌
  generateCard () {
    view.displayCard(utility.getRandomNumberArray(52))
  },

  //依照不同的遊戲狀態，做不同的行為 (event.target)
  dispatchCardAction (card) {
    if(!card.classList.contains('back')) return

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        view.renderTriedTimes(++model.triedTimes)

        if(model.isRevealedCardMatched()){
          //配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if(model.score === 260){
            view.showGameComplete()
            this.currentState = GAME_STATE.GameFinished
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        }else{
          //配對失敗
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    // console.log('current state:', this.currentState)
    // console.log('revealed cards:', model.revealedCards.map(card => card.dataset.index))
    // console.log(card.dataset.index)
  },

  //配對失敗，重置卡片
  resetCards () {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

const utility = {
  //取亂數陣列 (number => array)
  getRandomNumberArray (count) {
    const number = Array.from(Array(count).keys())
    for(let index = number.length - 1; index > 0; index--){
      let randomIndex = Math.floor(Math.random() * (index + 1))
      ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

//呼叫發牌
controller.generateCard()


//綁定卡片監聽器
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    // console.log(card)
    controller.dispatchCardAction(card)
  })
})

