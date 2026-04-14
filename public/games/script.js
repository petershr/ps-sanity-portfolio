const SUITS = ["C", "D", "H", "S"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "0", "J", "Q", "K"];

const FACE_ATTEMPTS = { "J": 1, "Q": 2, "K": 3, "A": 4 };

let playerHand = [];
let botHand = [];
let pot = [];
let difficulty = 2;
let gameStatus = 0; // 1 => player lose, 2 => player win
let canPlayerPlay = true;
let canPlayerSlap = true;
let canBotPlay = false;
let canBotSlap = true;
let burnPile = [];
let challenge = null;
let botSlapTimeout = null; // if bot was going to slap after delay but player slaps/plays, cancel the process
let botPlayTimeout = null;
let slapTimeout = null; // just for visual message

function createDeck() {
    let deck = [];
    for (let suit of SUITS) {
        for (let value of VALUES) {
            deck.push({ rank: value, suit: suit });
        }
    }
    return deck;
}

//help from Claude
function cardImg(card) {
    return `https://deckofcardsapi.com/static/img/${card.rank}${card.suit}.png`;
}

//standard Fisher-Yates shuffle
//help from Claude
function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function deal(deck) {
    playerHand = deck.slice(0, 26);
    botHand = deck.slice(26);
}

function render() {
    let top = burnPile[burnPile.length - 1];
    if (burnPile.length > 0) {
        document.getElementById("burn-pile").src = cardImg(top);
    } else {
        document.getElementById("burn-pile").src = "https://img.freepik.com/free-vector/flame-flat-style_78370-7477.jpg?semt=ais_incoming&w=740&q=80";
    }
    document.getElementById("bot-count").textContent = `Bot cards: ${botHand.length}`;
    document.getElementById("ply-count").textContent = `Your cards: ${playerHand.length}`;

    if (botHand.length > 0) {
        document.getElementById("bot-card").src = "https://deckofcardsapi.com/static/img/back.png";
    } else {
        document.getElementById("bot-card").src = "";
    }
    if (playerHand.length > 0) {
        document.getElementById("ply-card").src = "https://deckofcardsapi.com/static/img/back.png";
    } else {
        document.getElementById("ply-card").src = "";
    }

    updateControls();

    let potContainer = document.getElementById("pot-container");
    potContainer.innerHTML = "";
    //help from Claude
    pot.slice(-3).forEach((card, i) => {
        let img = document.createElement("img");
        img.src = cardImg(card);
        img.className = "pot-card";
        img.style.transform = `translateY(-${i * 25}px)`;
        img.style.transform = `translateX(-${i * 25}px)`;
        potContainer.appendChild(img);
    });

    let status = "";
    if (challenge) {
        status = `${challenge.challenger}'s challenge - Attempts left: ${challenge.attemptsLeft}`;
    } else if (canPlayerPlay) {
        status = "Your turn";
    } else {
        status = "Bot Thinking...";
    }
    document.getElementById("status").textContent = status;

    let cards = document.querySelectorAll(".pot-card");
    if (cards.length > 0) {
        let cardy = cards[cards.length - 1];
        cardy.classList.add("played");
        setTimeout(() => {
            cardy.classList.remove("played");
        }, 250);
    }

    console.log('render - right before checking gameover');

    if (botHand.length === 0) {
        console.log('render - bothand = 0, check game');
        if (!((challenge && challenge.challenger === "bot") || validSlap())) { //potential for game to continue if there is slap or bot placed face card
            console.log('render, gamestatus 2 over');
            gameStatus = 2;
            gameOver();
        }
    }
    if (playerHand.length === 0) {
        console.log('render - playhand = 0, check game');
        if (!((challenge && challenge.challenger === "player") || validSlap())) { // but for if player placed the face card
            console.log('render, gamestatus 1 over');
            gameStatus = 1;
            gameOver();
        }
    }
}

function startGame() {
    let deck = shuffle(createDeck());
    deal(deck);
    render();
}

function resetGame() {
    playerHand = [];
    botHand = [];
    pot = [];
    gameStatus = 0;
    burnPile = [];
    canPlayerPlay = true;
    canPlayerSlap = true;
    canBotPlay = false;
    canBotSlap = true;
    challenge = null;
    if (botSlapTimeout) {
        clearTimeout(botSlapTimeout);
        botSlapTimeout = null;
    }
    if (botPlayTimeout) {
        clearTimeout(botPlayTimeout);
        botPlayTimeout = null;
    }
    if (slapTimeout) {
        clearTimeout(slapTimeout);
        slapTimeout = null;
    }
    document.getElementById("win-message").textContent = "";
    document.getElementById("win-message").removeAttribute("style");
    console.log('reset game');
    startGame();
}

function resolveChallenge(card) {
    if (!challenge) {
        return false;
        console.log('no challenge - attempted resolveChallenge');
    }
    //help from Claude
    if (FACE_ATTEMPTS[card.rank]) {
        console.log('back to back face cards');
        challenge.attemptsLeft = FACE_ATTEMPTS[card.rank];
        if (challenge.challenger === "player") {
            challenge.challenger = "bot";
            console.log('CHALLENGER: player switched to BOT');
        } else {
            challenge.challenger = "player";
            console.log('CHALLENGER: bot switched to PLAYER');
        }
        return false;
    }
    challenge.attemptsLeft--;
    console.log('attemps left --');
    if (challenge.attemptsLeft === 0) { // ADD THE FUNCTIONALITY THAT CONSIDERS VALID SLAP, below is perfectly suitable for no valid slap (like normal settimeout or something)
        console.log('challenge over!');
        let winner = challenge.challenger;
        challenge = null;

        if (validSlap()) {
            console.log('0 attempts left but valid slap is there!');
            canPlayerPlay = false;
            canPlayerSlap = true;
            canBotPlay = false;
            canBotSlap = true;
            render();
            let [min, max] = diffRange();
            botSlapTimeout = setTimeout(() => {
                botSlapTimeout = null;
                if (validSlap()) {
                    if (winner === "bot") {
                        console.log('0 attempts but bot wins slap');
                        botSlap();
                    } else {
                        console.log('0 attempts but player wins slap');
                        collectPot("player");
                        canPlayerPlay = false;
                        canPlayerSlap = true;
                        setTimeout(() => {
                            canPlayerPlay = true;
                            canPlayerSlap = true;
                            render();
                        }, 500)
                    }
                }
            }, randTime(min, max) * 1000);
        }

        setTimeout(() => {
            if (winner === "bot") {
                console.log('bot wins challenge -> botSlap()');
                botSlap();
            } else {
                console.log('player wins challenge');
                collectPot("player");
                canPlayerPlay = false;
                canPlayerSlap = true;
                canBotPlay = false;
                canBotSlap = true;
                setTimeout(() => {
                    canPlayerPlay = true;
                    canPlayerSlap = true;
                    render();
                }, 500);
            }
        }, 1000);
        return true;
    }
    return false;
}

function playCard() {
    if (!canPlayerPlay) {
        console.log('playCard: !canPlayerPlay => return');
        return;
    }
    if (playerHand.length === 0) {
        console.log('playCard: player hand is empty => game status 1 and return');
        gameStatus = 1;
        //gameOver();
        render();
        return; //player lost
    }
    //help from Claude to clearthe timeouts and also identify where I need to do this
    if (botSlapTimeout) {
        console.log('cleared botslaptimeout');
        clearTimeout(botSlapTimeout);
        botSlapTimeout = null;
    }

    if (botPlayTimeout) {
        console.log('cleared botplaytimeout');
        clearTimeout(botPlayTimeout);
        botPlayTimeout = null;
    }

    let card = playerHand.shift();
    pot.push(card);

    canPlayerPlay = false;
    canPlayerSlap = true;
    canBotPlay = true;
    canBotSlap = true;
    render();
    console.log('playCard: just shift, push, boolean, and rendered');
    //bot plays face card
    if (challenge && challenge.challenger === "bot") {
        let ended = resolveChallenge(card);
        if (!ended) {
            console.log('playCard, challenger is bot, ended resulted false');
            if (challenge.challenger === "player") {
                console.log('playcard, challenger from bot to player');
                canPlayerPlay = false;
                canBotPlay = true;
                render();
                let [min, max] = diffRange();
                botSlapTimeout = setTimeout(() => {
                    botSlapTimeout = null;
                    if (validSlap()) {
                        console.log('playcard, challenger from bot to player, valid bot slap');
                        botSlap();
                    } else {
                        console.log('playcard, challenger from bot to player, not valid, bot play');
                        botPlay();
                    }
                }, randTime(min, max) * 1000);
            } else {
                console.log('playCard, challenger still bot');
                canPlayerPlay = true;
                canPlayerSlap = true;
                render();

                let [min, max] = diffRange();
                botSlapTimeout = setTimeout(() => {
                    botSlapTimeout = null;
                    if (validSlap()) {
                        console.log('playCard, challenger still bot, valid slap found');
                        botSlap();
                    }
                }, randTime(min, max) * 1000);


            }
        }
        console.log('playcard, returning from challenge');
        return;
    }

    if (FACE_ATTEMPTS[card.rank]) {
        console.log('playcard, facecard played');
        challenge = { challenger: "player", attemptsLeft: FACE_ATTEMPTS[card.rank] };
    }

    let [min, max] = diffRange();
    botSlapTimeout = setTimeout(() => {
        botSlapTimeout = null;
        if (validSlap()) {
            console.log('playcard, valid bot slap');
            botSlap();
        } else {
            botPlay();
            console.log('playcard, bot play');
        }
    }, randTime(min, max) * 1000);
}

function badSlap() {
    if (playerHand.length > 0) {
        burnPile.push(playerHand.shift());
    }
    showSlap("Burn!");
    render();
    if (canBotPlay || (!canPlayerPlay && !challenge)) {
        let [min, max] = diffRange();
        botPlayTimeout = setTimeout(() => {
            botPlayTimeout = null;
            if (validSlap()) {
                botSlap();
            } else {
                botPlay();
            }
        }, randTime(min, max) * 1000);
    }
}

function validSlap() {
    if (pot.length < 2) {
        return false;
    }

    //double
    let top = pot[pot.length - 1];
    let second = pot[pot.length - 2];
    if (top.rank === second.rank) {
        return true;
    }

    //marriage
    if ((top.rank === "Q" && second.rank === "K") || (top.rank === "K" && second.rank === "Q")) {
        return true;
    }

    if (pot.length > 2) {
        //sandwich
        let third = pot[pot.length - 3];
        if (top.rank === third.rank) {
            return true;
        }

        //divorce
        if ((top.rank === "Q" && third.rank === "K") || (top.rank === "K" && third.rank === "Q")) {
            return true;
        }
    }

    //top and bottom
    let bottom = pot[0];
    if (top.rank === bottom.rank) {
        return true;
    }
    return false;
}

function playerSlap() {
    if (gameStatus !== 0 || !canPlayerSlap) {
        return;
    }

    if (botSlapTimeout) {
        clearTimeout(botSlapTimeout);
        botSlapTimeout = null;
    }

    if (botPlayTimeout) {
        clearTimeout(botPlayTimeout);
        botPlayTimeout = null;
    }

    if (validSlap()) {
        collectPot("player");
        canPlayerPlay = false; //stop all play until after a small delay to collect pot
        canPlayerSlap = false;
        canBotPlay = false;
        showSlap("SLAP!");
        //render(); wonder what this does move render from here to below
        setTimeout(() => {
            canPlayerPlay = true; //successful player slap, player starts first next round
            canPlayerSlap = true;
            render();
        }, 500);
    } else {
        badSlap();
    }
}

function botPlay() {
    console.log('begin botPlay()');
    if (!canBotPlay) {
        console.log('exit botplay because !canBotPlay');
        return; //bot should not play right now (like when player is dealing with challenge)
    }

    if (botHand.length === 0) {
        console.log('exit botplay because botHand empty');
        gameStatus = 2;
        //gameOver();
        render();
        return; //bot lost
    }

    if (challenge && challenge.challenger === "bot") {
        console.log('exit botplay because bot is challenger');
        return; //don't interrupt the player after bot places face card
    }

    let card = botHand.shift();
    pot.push(card);
    console.log('botplay shift and push');

    if (challenge && challenge.challenger === "player") {
        console.log('botplay challenger is player');
        let ended = resolveChallenge(card);
        if (ended) {
            console.log('botplay exit because challenger is player => ended challenge');
            render();
            return;
        }

        if (challenge && challenge.challenger === "bot") { //if back to back face cards, challenger switches
            canPlayerPlay = true;
            canPlayerSlap = true;
            canBotPlay = false;
            canBotSlap = true;
            console.log('botplay exit because challenger switch from player to bot');
            render();
            let [min, max] = diffRange();
            botSlapTimeout = setTimeout(() => {
                botSlapTimeout = null;
                if (validSlap()) {
                    console.log('botplay, challenger switched to bot, valid slap found');
                    botSlap();
                }
            }, randTime(min, max) * 1000);
            return;
        }

        canPlayerPlay = false;
        canPlayerSlap = true;
        canBotPlay = true;
        canBotSlap = true;
        render();
        let [min, max] = diffRange();
        botPlayTimeout = setTimeout(() => {
            botPlayTimeout = null;
            console.log('botplay, sees challenge, runs botplay again');
            botPlay();
        }, randTime(min, max) * 1000);
        return;
    }
    console.log('botplay, no active challenge from player');
    //Claude's suggestion to add console.log, which I used to debug myself

    //no active challenge from player
    if (FACE_ATTEMPTS[card.rank]) {
        console.log('botplay, bot places face card => bot is challenger');
        challenge = { challenger: "bot", attemptsLeft: FACE_ATTEMPTS[card.rank] };
        canPlayerPlay = true;
        canPlayerSlap = true;
        canBotPlay = false;
        canBotSlap = true;
        render();
        return;
    }
    console.log('botplay, no special case, looking for validslap');
    canPlayerPlay = true;
    canPlayerSlap = true;
    canBotPlay = false;
    canBotSlap = true;
    render();
    let [min, max] = diffRange();
    botSlapTimeout = setTimeout(() => {
        botSlapTimeout = null;
        if (validSlap()) {
            console.log('botplay, no special case, botSlap');
            botSlap();
        }
    }, randTime(min, max) * 1000);
}

function botSlap() {
    let [min, max] = diffRange();
    collectPot("bot");
    canPlayerPlay = false;
    canBotPlay = false;
    showSlap("Bot Slapped!");
    render();
    setTimeout(() => {
        canBotPlay = true; // successful bot slap, bot goes first next round
        botPlayTimeout = setTimeout(() => {
            botPlayTimeout = null;
            botPlay();
        }, randTime(min, max) * 250);
    }, 500);
}

function collectPot(who) {
    console.log(`${who} collects pot`);
    if (who === "player") {
        playerHand.push(...pot, ...burnPile);
        canPlayerPlay = true;
        canPlayerSlap = true;
        canBotPlay = false;
        canBotSlap = true;
    } else {
        botHand.push(...pot, ...burnPile);
        canPlayerPlay = false;
        canPlayerSlap = true;
        canBotPlay = true;
        canBotSlap = true;
    }
    updateControls();
    challenge = null;
    pot = [];
    burnPile = [];
}

function gameOver() {
    let message = "";
    if (gameStatus === 2) {
        message = "You Win!";
    } else {
        message = "You lose.";
    }

    //made the message myself but needed Claude's help for styling it, couldn't do it directly on .css
    let winner = document.getElementById("win-message");
    winner.textContent = message;
    winner.style.cursor = "pointer";
    winner.style.backgroundColor = "white";
    winner.style.borderRadius = "8px";
    winner.style.width = "fit-content";
    winner.style.height = "fit-content";
    winner.style.padding = "0.5rem 1.5rem";
    winner.style.margin = "auto";
    winner.addEventListener("click", resetGame, { once: true });
}

function setDifficulty(diff) {
    difficulty = diff;
}

function diffRange() {
    if (difficulty === 1) {
        //easy mode, bot timing range: 1.2-1.7 second
        return [1.2, 1.7];
    }
    if (difficulty === 2) {
        //medium mode, bot timing range: 0.7-1.2 second
        return [0.7, 1.2];
    }
    if (difficulty === 3) {
        // hard mode, bot timing range: 0.4-0.6 second
        return [0.4, 0.6];
    }
}

function randTime(min, max) {
    return Math.random() * (max - min) + min;
}

function updateControls() {
    document.getElementById("play").disabled = !canPlayerPlay;
}

function showSlap(input) {
    let text = document.getElementById("slap-status");
    if (slapTimeout) {
        clearTimeout(slapTimeout);
    }
    text.textContent = input;
    text.style.transition = "opacity 0.25s ease-in";
    text.style.opacity = "1";

    slapTimeout = setTimeout(() => {
        slapTimeout = null;
        text.style.transition = "opacity 0.25s ease-out";
        text.style.opacity = "0";
        setTimeout(() => {
            text.textContent = "";
        }, 300);
    }, 800);
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("play").addEventListener("click", playCard);
    document.getElementById("slap").addEventListener("click", playerSlap);
    document.querySelector(".reset").addEventListener("click", resetGame);
    document.addEventListener('keydown', function (event) {
        if (event.key === 'j') {
            playCard();
        } else if (event.key === ' ') {
            event.preventDefault();
            playerSlap();
        }
    });
    document.querySelector(".easy").addEventListener("click", () => setDifficulty(1));
    document.querySelector(".medium").addEventListener("click", () => setDifficulty(2));
    document.querySelector(".hard").addEventListener("click", () => setDifficulty(3));
    startGame();
});