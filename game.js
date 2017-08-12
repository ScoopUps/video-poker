// console.log('Game.js is ready')


//create card class
class Card {
  //use constructor taking rank and suit as inputs
  constructor(rank, suit){
    //rank will be the card's value i.e. K, 9, J, etc.
    this.rank = rank;
    //suit will be the card's suit family in UTF-8 symbolic form
    this.suit = suit;
    //set initial color to black
    this.color = 'black';
    //if suit is a heart or diamond, set the color to red
    if (this.suit === '&#9829' || this.suit === '&#9830'){
      this.color = 'red';
    }
    //hold condition to check for when thrust onto game board
    this.held = false;
  }
}

//GLOBAL VARIABLES!!!

//empty deck array to populate with cards
const deck = [];
//array of card rank values
const ranks = [2,3,4,5,6,7,8,9,10,'J', 'Q', 'K', 'A'];
//array of card suit values
const suits = ['&#9824', '&#9827', '&#9829', '&#9830'];
//array to be the main representation of the game's 5-card draw board
const board = [];
//variable to store credit bank
let credits = 80;
//variable to check within dealer function if bet has been made
let hasBet = false;

//HELPER FUNCTIONS FOR GENERAL GAME!!!

//helper function to populate the deck
function popDeck(){
  //clear the deck to populate
  deck.length = 0;
  //double loop to cnstrust 52 cards from the suit and rank arrays
  for (let i = 0; i<suits.length; i++){
    for (let j = 0; j<ranks.length; j++){
      deck.push(new Card(ranks[j], suits[i]));
    }
  }
}

//helper function to shuffle the deck array
function shuffle(deck){
  //random num of shuffles up to 52 to scatter the deck
  let numOfShuffles = Math.floor(Math.random()* 52);
  for (let n = 0; n<numOfShuffles; n++){
    //sort the deck using a randomizer by the num of shuffles variable
    deck.sort(function(a,b){
      if(Math.random() > .5){
        return 1;
      }else{
        return -1;
      }
    });
  }
}

//helper function to populate the main game board
function popBoard (){
  board.length = 0;
  while(board.length < 5){
    let tempCard = deck.pop();
    board.push(tempCard);
  }
}

//helper function to draw the appropriate cards
function dealBoard(){
  //jQuery card selectors
  let $card1 = $('#card1');
  let $card2 = $('#card2');
  let $card3 = $('#card3');
  let $card4 = $('#card4');
  let $card5 = $('#card5');
  let $cards = [$card1, $card2, $card3, $card4, $card5];
  //for loop to replace cards not held
  for (let p = 0; p<board.length; p++){
    if (board[p].held === false){
      //pop a value off the deck and insert into unheld card position
      board[p] = deck.pop();
      //add red styling for hearts/diamonds
      $cards[p].css('color', board[p].color);
      //add visual card representation into unheld card position
      $cards[p].html('<span class="ranksuit">' + board[p].rank + '</br>'  + board[p].suit + '</span><div class="innercard"></div>');
    }
  }
}

//helper function to reopen closed event listeners
function resetListeners(){
  //reset bet max button listener
  $('#betmax').on('click', bettor);
  //reset deal button listener
  $('#deal').on('click', dealer);
  //rest hold buttons listener
  $('.hold').on('click', holder);
  //clear held alerts from bar
  $('#holdalert').children().empty();
}

//helper function to handle held cards
function holder() {
    if (board.length === 0 || hasBet === false){
    return;
    }
    //store id of clicked hold button
    let $holdNum = $(this).attr('id');
    //store index of clicked hold to use on board array
    let index = parseInt($holdNum.charAt(4) - 1);
    //select hold alert span elements
    let $ha1 = $('#ha1');
    let $ha2 = $('#ha2');
    let $ha3 = $('#ha3');
    let $ha4 = $('#ha4');
    let $ha5 = $('#ha5');
    //put hold alert elements into array
    let $has = [$ha1, $ha2, $ha3, $ha4, $ha5];
      //conditional to toggle the hold true/false and the hold alert on/off
      if (board[index].held === false){
        $has[index].html('HELD');
        board[index].held = true;
      }else if(board[index].held === true){
        $has[index].empty();
        board[index].held = false;
      }
}

//helper function to attach to deal button
function dealer(){
  //check to see if board has been populated and a bet has been placed
  if (board.length === 0 || hasBet === false){
    return;
  }
  //deal where appropriate on the board
  dealBoard();
  //remove deal and hold click events
  $('#deal').off('click');
  $('.hold').off('click');
  //check for final win and reattach event listeners
  checkWin2(board);
  //reset bet to false
  hasBet = false;
}

//helper function to attach to bet button
function bettor(){
  //set bet to true
  hasBet = true;
  //repopulate the deck
  popDeck();
  //deduct bet from credit bank
  credits -= 5;
  //output new credit total
  $('#creditcount').html(credits);
  //shuffle deck
  shuffle(deck);
  //populate the board
  popBoard();
  let tempBoard = board;
  //select all the card elements
  let $card1 = $('#card1');
  let $card2 = $('#card2');
  let $card3 = $('#card3');
  let $card4 = $('#card4');
  let $card5 = $('#card5');
  //put card elements into array
  let $cards = [$card1, $card2, $card3, $card4, $card5];
  //for loop to render cards
  for(let p = 0; p<board.length; p++){
    $cards[p].removeClass('placeholder');
    $cards[p].css('color', board[p].color);
    $cards[p].html('<span class="ranksuit">' + board[p].rank + '</br>'  + board[p].suit + '</span><div class="innercard"></div>');
  }
  checkWin1(tempBoard);
  $('#betmax').off('click');
}

//HELPER FUNCTIONS FOR WIN CONDITIONS!!!

//function to check board for pair of jacks or better
function jacksOB(b){
    //boolean check for pair of jacks or better
    let hasJOB = false;
    //array of jacks or better to compare index of later
    const jobArr = ['J', 'Q', 'K', 'A',];
    //container array for value of pairs
    const pairs = [];
    //temporary object to tally number of card values
    let tally = {};
    //for loop accumulating number of card values
    for (let a = 0; a<b.length; a++){
      if(!(b[a].rank in tally)){
        tally[b[a].rank] = 1;
      }else{
        tally[b[a].rank] += 1;
      }
    }
    //for-in construct to check tally for pair of jacks or better, push into pairs array and return true if so
    for (let p in tally){
      if (tally[p] === 2 && jobArr.indexOf(p) !== -1){
        hasJOB = true;
        pairs.push(p);
      }
    }
    return hasJOB;
}

//function to check board for two pair
function twoPair(b){
    //boolean check for two pairs
    let hasTwoPair = false;
    //container array for value of pairs
    const pairs = [];
    //temporary object to tally number of card values
    let tally = {};
    //for loop accumulating number of card values
    for (let a = 0; a<b.length; a++){
      if(!(b[a].rank in tally)){
        tally[b[a].rank] = 1;
      }else{
        tally[b[a].rank] += 1;
      }
    }
    //for-in construct to check tally and collect pairs into array, push into pairs array
    for (let p in tally){
      if (tally[p] === 2){
        pairs.push(p);
      }
    }
    if (pairs.length > 1){
      hasTwoPair = true;
    }
    return hasTwoPair;
  }

//function to check board for three of a kind
function threeKind(b){
    //boolean check for three of a kind
    let hasThreeKind = false;
    //container array for value of pairs
    const three = [];
    //temporary object to tally number of card values
    let tally = {};
    //for loop accumulating number of card values
    for (let a = 0; a<b.length; a++){
      if(!(b[a].rank in tally)){
        tally[b[a].rank] = 1;
      }else{
        tally[b[a].rank] += 1;
      }
    }
    //for-in construct to check tally and collect pairs into array, push into pairs array
    for (let p in tally){
      if (tally[p] === 3){
        hasThreeKind = true;
        three.push(p);
      }
    }
    return hasThreeKind;
  }

//function to check board for straight
function straight(b){
  //boolean check for straight
  let hasStraight = false;
  //fork two functions to check for low-ace straight and high-ace straight cases
  function lowStraight(bl){
    //comparison array to check for straights with the low ace
    const aceLowArr = ['A',2,3,4,5,6,7,8,9,10,'J', 'Q', 'K'];
    //helper function to compare two elements along the low ace spectrum
    function sortLow(c,d){
      const aceLow = ['A',2,3,4,5,6,7,8,9,10,'J', 'Q', 'K'];
      return aceLow.indexOf(c.rank) - aceLow.indexOf(d.rank);
    }
    //make a copy of sorted array without mutating original by adding slice method
    let tempBoardL = b.slice(0).sort(sortLow);
    //variable to use as initial index for low ace array
    let low = aceLowArr.indexOf(tempBoardL[0].rank);
    //array to contain true/false values for low ace case
    const lowAceTrueArr = [];
    //for loop to compare low sorted board array against low ace array
    for (let ind = 0; ind<tempBoardL.length; ind++){
      lowAceTrueArr.push(tempBoardL[ind].rank === aceLowArr[low]);
      low += 1;
    }
    if(lowAceTrueArr.indexOf(false) === -1){
      hasStraight = true;
    }
  }
  function highStraight(bh){
    //comparison array to check for straights with the high ace
    const aceHighArr = [2,3,4,5,6,7,8,9,10,'J', 'Q', 'K', 'A'];
    //helper function to compare two elements along the high ace spectrum
    function sortHigh(c,d){
      const aceHigh = [2,3,4,5,6,7,8,9,10,'J', 'Q', 'K', 'A'];
      return aceHigh.indexOf(c.rank) - aceHigh.indexOf(d.rank);
    }
    //make a copy of sorted array without mutating original by adding slice method
    let tempBoardH = bh.slice(0).sort(sortHigh);
    //variable to use as initial index for high ace array
    let high = aceHighArr.indexOf(tempBoardH[0].rank);
    //array to contain true/false values for high ace case
    const highAceTrueArr = [];
    //for loop to compare high sorted board array against high ace array
    for (let j = 0; j<tempBoardH.length; j++){
      highAceTrueArr.push(tempBoardH[j].rank === aceHighArr[high]);
      high += 1;
    }
    //condtional to check if either low ace or high ace cases result in straight hand
    if (highAceTrueArr.indexOf(false) === -1){
      hasStraight = true;
    }
  }
  lowStraight(b);
  highStraight(b);
  return hasStraight;
}

function flush(b){
  //boolean check for flush
  let hasFlush = false;
  const arr = [];
  //push each suit into temporary container array
  for (let i = 0; i< b.length; i++){
    arr.push(b[i].suit);
  }
  //predicate functions checking for each of the 4 suits
  function isSpade(el){
    return el === '&#9824';
  }
  function isClub(el){
    return el === '&#9827';
  }
  function isHeart(el){
    return el === '&#9829';
  }
  function isDiamond(el){
    return el === '&#9830';
  }
  //check elements of container array using every method against each suit
  if(arr.every(isSpade) || arr.every(isClub) || arr.every(isHeart) || arr.every(isDiamond)){
    hasFlush = true;
  }
  return hasFlush;
}

function fullHouse(b){
    //boolean check for full house
    let hasFullHouse = false;
    //container array for value of three of a kind and a pair
    const three = [];
    const pair = [];
    //temporary object to tally number of card values
    let tally = {};
    //for loop accumulating number of card values
    for (let a = 0; a<b.length; a++){
      if(!(b[a].rank in tally)){
        tally[b[a].rank] = 1;
      }else{
        tally[b[a].rank] += 1;
      }
    }
    //for-in construct to check tally and collect pairs into array, push into pairs array
    for (let p in tally){
      if (tally[p] === 3){
        three.push(p);
      }else if(tally[p] === 2){
        pair.push(p);
      }
    }
    if (three.length === 1 && pair.length === 1){
      hasFullHouse = true;
    }
    return hasFullHouse;
}

//function to check board for four of a kind
function fourKind(b){
    //boolean check for four of a kind
    let hasFourKind = false;
    //container array for value of pairs
    const four = [];
    //temporary object to tally number of card values
    let tally = {};
    //for loop accumulating number of card values
    for (let a = 0; a<b.length; a++){
      if(!(b[a].rank in tally)){
        tally[b[a].rank] = 1;
      }else{
        tally[b[a].rank] += 1;
      }
    }
    //for-in construct to check tally and collect pairs into array, push into pairs array
    for (let p in tally){
      if (tally[p] === 4){
        hasFourKind = true;
        four.push(p);
      }
    }
    return hasFourKind;
  }

//function to check board for straight flush
function straightFlush(b){
  //boolean check for straight flush
  let hasStraightFlush = false;
  //check if the board is both flush and straight using existing predicate functions
  if (flush(b) && straight(b)){
    hasStraightFlush = true;
  }
  return hasStraightFlush;
}

//function to check board for royal flush
function royalFlush(b){
  //boolean check for royal flush
  let hasRoyalFlush = false;
  function royalStraight(br){
    let hasRoyalStraight = false;
    //comparison array to check for royal straight
    const royalArr = [10,'J', 'Q', 'K', 'A'];
    //helper function to compare two elements along royal spectrum
    function sortRoyal(c,d){
      const royal = [10,'J', 'Q', 'K', 'A'];
      return royal.indexOf(c.rank) - royal.indexOf(d.rank);
    }
    //make a copy of sorted array without mutating original by adding slice method
    let tempBoardR = br.slice(0).sort(sortRoyal);
    //variable to use as initial index for royal straight array
    let royalIndex = royalArr.indexOf(tempBoardR[0].rank);
    //array to contain true/false values for royal straight case
    const royalTrueArr = [];
    //for loop to compare sorted board array against royal straight array
    for (let j = 0; j<tempBoardR.length; j++){
      royalTrueArr.push(tempBoardR[j].rank === royalArr[royalIndex]);
      royalIndex += 1;
    }
    //condtional to check royal boolean container array for true/false values
    if (royalTrueArr.indexOf(false) === -1){
      hasRoyalStraight = true;
    }
    return hasRoyalStraight;
  }
  //conditional check to see if board has both royal straight and flush properties
  if (royalStraight(b) && flush(b)){
    hasRoyalFlush = true;
  }
  return hasRoyalFlush;
}

function checkWin1(hand){
  let $message = $('#message');
  $message.html('jacks or better: ' + jacksOB(hand) + '</br>' +
                'two pair: ' + twoPair(hand) + '</br>' +
                'three of a kind: ' + threeKind(hand) + '</br>' +
                'straight: ' + straight(hand) + '</br>' +
                'flush: ' + flush(hand) + '</br>' +
                'full house: ' + fullHouse(hand) + '</br>' +
                'four of a kind: ' + fourKind(hand) + '</br>' +
                'straight flush: ' + straightFlush(hand) + '</br>' +
                'royal flush: ' + royalFlush(hand));
}

function checkWin2(hand){
  let $message = $('#message');
  $message.empty();
  $message.html('jacks or better: ' + jacksOB(hand) + '</br>' +
                'two pair: ' + twoPair(hand) + '</br>' +
                'three of a kind: ' + threeKind(hand) + '</br>' +
                'straight: ' + straight(hand) + '</br>' +
                'flush: ' + flush(hand) + '</br>' +
                'full house: ' + fullHouse(hand) + '</br>' +
                'four of a kind: ' + fourKind(hand) + '</br>' +
                'straight flush: ' + straightFlush(hand) + '</br>' +
                'royal flush: ' + royalFlush(hand));
  resetListeners();
}


//EVENT LISTENERS!!!

$(document).ready(function(){
  // console.log('Ready freddy');

  //click event for the hold buttons
  $('.hold').on('click', holder);

  //click event to hold when clicking the cards themselves
  $('.card').on('click', holder);

  //click event to initialize board and take bet
  $('#betmax').on('click', bettor);

  //click event to
  $('#deal').on('click', dealer);

});
