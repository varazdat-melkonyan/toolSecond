const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let data;
let dupValues = [];
let datSign = [];
let values = [];
let keepValue = false;
let scrolling = false;
let done = false;
let originalData = [];
let href = window.location.href;
let index = 1;
let currentWord = [];
let signShuff = ["<", ">", "="];

jQuery.event.special.wheel = {
    setup: function( _, ns, handle ) {
        this.addEventListener("wheel", handle, { passive: !ns.includes("noPreventDefault") });
    }
};

const onPageLoad = async () => {
    data = await $.get('data/data.json');
    data = data.elements;

    for(let i = 0; i < data.length - 1; i++) {
            dupValues.push(data[i].value);
            datSign.push(data[i].sign);
    }

    for (let i = 0; i < dupValues.length; i++) dupValues[i] = {value: dupValues[i]};

    for (let i =  0; i < data.length; i++) {
        values.push({value: data[i].value});
    }

    let rand = Math.floor(Math.random() * dupValues.length);
    currentWord.push(rand,rand);

    signShuff = shuffle(signShuff);

    originalData = JSON.parse(JSON.stringify(data));

    addWords(".left", currentWord[0], 0);
    addWords(".right", currentWord[1], 1);
    $(".signs").append(`<div id="sign_0" class="topSign sign"><p>${signShuff[0]}</p></div>`);
    $(".signs").append(`<div id="sign_1" class="currentSign sign"><p>${signShuff[1]}</p></div>`);
    $(".signs").append(`<div id="sign_2" class="bottomSign sign"><p>${signShuff[2]}</p></div>`);

    $(".signs" ).on('wheel', async function (e) { wheel(e) });
    loader.toggle();
}

const shuffle = (array) => {
	let currentIndex = array.length, tempVal, randomIndex;

	while (0 !== currentIndex)
	{
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		tempVal = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = tempVal;
	}

	return array;
}

const wheel = async (e) => {
    if (!scrolling && !done) {
        let dir = Math.sign(e.originalEvent.wheelDelta);
        let newIndex = index - dir;

        if (newIndex >= 0 && newIndex <= 2)
        {
            scrolling = true;
            index -= dir;
            await view.scrollSign(dir);
            setTimeout(() => {
                scrolling = false;
            }, 700);
        }
    }
}

const addWords = async (parent, index, type) => {
    if (keepValue && type == 1) {
        if (dupValues.length < 3) {
            await view.addPair(getWord(index, type), getWord(index - 1, type), getWord(index + 1, type), parent, type);
        } else {
            await view.addPair(getWord(index, type), getWord(index - 1, type), getWord(index + 1, type), parent, type);
        }
    } else {
        await view.addPair(getWord(index, type), getWord(index - 1, type), getWord(index + 1, type), parent, type);
    }
}

const scrollToWord = async (index, dir, parent, type, reset, generate) => {
    await view.updatePair(getWord(index, type), getWord(index - 1, type), getWord(index + 1, type), dir, parent, type, reset, generate);
}

const check = async () => {
    view.flashCircle();
    scrolling = true;
    $("#check").attr("onclick", "");

    if (getWord(currentWord[0], 0).value == getWord(currentWord[1], 1).value && getWord(currentWord[0], 0).sign == $(`#sign_${index}`).text()) {
        view.toggleFlash("green");

        data.splice(data.indexOf(getWord(currentWord[0])), 1);
        values.splice(values.indexOf(getWord(currentWord[1], 1)), 1);
        view.deletePair();
        $(".sign").css("opacity", "0");
        await timeout(1000);
        for (let i = 0; i < currentWord.length; i++) {
            if (!keepValue || (keepValue && i == 0))
                currentWord[i]--;
            
            let obj = i == 0 ? ".left" : ".right";

            let length = keepValue && i == 1 ? dupValues.length : data.length;

            if (data.length == 2) {
                view.secondLastScroll(obj);
            }
            else if (length >= 3) {
                scrollToWord(currentWord[i], -1, obj, i, true, true);
            }
            else if (length == 1) {
                view.lastScroll();
            } else if (data.length < 1) {
                done = true;
                view.end();
                $("#check").css("display", "none");
                break;
            }
        }
    }
    else {
        view.toggleFlash("red");
        await view.shake();
    }
    
    await timeout(900);
    scrolling = false;
    $("#check").attr("onclick", "check()");
}

const getWord = (newIndex, type) => {
    let length  = (type == 1 && keepValue) ? dupValues.length : data.length;
    if (type == 1 && !keepValue) length = values.length;
    newIndex %= length;
    
    if (newIndex < 0) {
        newIndex = length + newIndex;
    }
    else if (newIndex > length) {
        newIndex = 0;
    }

    if (type == 1 && !keepValue)
        return values[newIndex];
    return (type == 1 && keepValue) ? dupValues[newIndex] : data[newIndex];
}

$(onPageLoad);