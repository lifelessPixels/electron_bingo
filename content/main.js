
console.log(electronAPI);
let captions = electronAPI.getCaptions();
let state = {
    cards: null,
    editingCard: null,
    editingGUIShown: false,
    editingGUI: null,
    resetting: false,
    cardsState: null
};

document.getElementById("menu-close").addEventListener("mousedown", () => {
    electronAPI.saveCaptions(captions);
    electronAPI.closeWindow();
});

function resetState() {

    if(state.resetting) return false;
    state.resetting = true;

    let box = document.getElementById("cards-panel");
    box.classList.add("invisible");

    if(state.editingGUIShown) 
        document.getElementById("card-edit").classList.add("invisible");

    setTimeout(() => {
        
        state.editingGUI = document.getElementById("card-edit");

        state.cards = Array(25).fill(null);
        state.cardsState = Array(25).fill("false");
        state.editingCard = null;

        
        state.editingGUIShown = false;

        while(box.firstChild) box.removeChild(box.lastChild);
        for(let i = 0; i < 25; i++) {
            let card = document.createElement("div");
            card.id = "card-" + i.toString();
            card.classList.add("card");
            card.classList.add("card-inactive");
            card.addEventListener("mousedown", cardClickEvent);
            let paragraph = document.createElement("p");
            card.appendChild(paragraph);
            paragraph.innerText = captions[i];
            box.appendChild(card);
            state.cards[i] = card;
        }

        setTimeout(() => {
            box.classList.remove("invisible");
            state.resetting = false;
        }, 300);
        
    }, 250);

    return true;

}

// stolen from: https://stackoverflow.com/a/12646864
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function randomizeClick() {
    shuffleArray(captions);
    while(!resetState()); // wait for reset to complete otherwise it may lead to unconsistent state
}

function editCardSaveClick() {
    let newValue = document.getElementById("card-edit-input").value;
    if(state.editingCard != null) {
        captions[state.editingCard] = newValue;
        state.cards[state.editingCard].firstChild.innerText = newValue;
        state.cards[state.editingCard].classList.remove("card-editing");
        state.editingCard = null;
    }
    state.editingGUIShown = false;
    state.editingGUI.classList.add("invisible");
}

function editCardCancelClick() {
    if(state.editingCard != null) {
        state.cards[state.editingCard].classList.remove("card-editing");
        state.editingCard = null;
    }
    state.editingGUIShown = false;
    state.editingGUI.classList.add("invisible");
}

function cardClickEvent(e) {
    let element = e.target;
    while (element && element.nodeName.toLowerCase() != "div")
        element = element.parentNode;
    let id = parseInt(element.id.substring(5));

    if(e.button === 0) {
        // left mouse button
        if(element.classList.contains("card-inactive")) {
            // we have unclicked card
            element.classList.remove("card-inactive");
            element.classList.add("card-active");
            state.cardsState[id] = true;
        }
        else {
            // we have previously clicked card
            element.classList.remove("card-active");
            element.classList.add("card-inactive");
            state.cardsState[id] = false;
        }

        checkBoard();
    }
    else if(e.button === 2) {
        let card = state.cards[id];
        if(state.editingCard != null) {
            state.cards[state.editingCard].classList.remove("card-editing");
        }
        card.classList.add("card-editing");
        state.editingCard = id;

        let editField = document.getElementById("card-edit-input");
        editField.value = captions[id];
        if(!state.editingGUIShown) {
            state.editingGUI.classList.remove("invisible");
            state.editingGUIShown = true;
        }
        setTimeout(() => { editField.focus(); }, 150);
    }
    
}

function checkBoard() {

    // check rows & columns
    for(let i = 0; i < 5; i++) {
        let rowsGood = true;
        let colsGood = true;
        let negDiagGood = true;
        let posDiagGood = true;
        for(let j = 0; j < 5; j++) {
            rowsGood &= state.cardsState[i * 5 + j];
            colsGood &= state.cardsState[j * 5 + i];
            negDiagGood &= state.cardsState[j * 5 + j];
            posDiagGood &= state.cardsState[j * 5 + 4 - j];
        }
        if(rowsGood || colsGood || negDiagGood || posDiagGood) {
            document.getElementById("win-board").classList.remove("invisible");
        }
    }
        
}

function wonResetButtonClick() {
    document.getElementById("win-board").classList.add("invisible");
    resetState();
}

function onLoad() {
    // TODO: get captions from electron world
    document.getElementById("card-edit-save").addEventListener("click", editCardSaveClick);
    document.getElementById("card-edit-cancel").addEventListener("click", editCardCancelClick);
    document.getElementById("button-reset").addEventListener("click", resetState);
    document.getElementById("button-randomize").addEventListener("click", randomizeClick);
    document.getElementById("win-button-reset").addEventListener("click", wonResetButtonClick);
    resetState();
}

window.addEventListener("load", onLoad);