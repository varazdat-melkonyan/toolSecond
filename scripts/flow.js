const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let data;
let dupValues = [];
let values = [];
let keepValue = false;
let currentWord = [0, 0];
let scrolling = [false, false];
let shuffledIndexes = [];
let done = false;
let originalData = [];
let href = window.location.href;

jQuery.event.special.wheel = {
    setup: function( _, ns, handle ) {
        this.addEventListener("wheel", handle, { passive: !ns.includes("noPreventDefault") });
    }
};

const onPageLoad = async () => {
    $.get('data/data.json', function (json) {
        data = json.elements;

        if (data.keepValue === undefined) keepValue = false;
        else keepValue   = data.keepValue;
        href = href.substring(0, href.indexOf("?"));

        if (keepValue) {
            for(let i = 0; i < data.length - 1; i++) {
                if (data[i + 1].value == data[i].value && !dupValues.includes(data[i].value)) {
                    dupValues.push(data[i].value);
                }
            }
        }

        for (let i = 0; i < dupValues.length; i++) dupValues[i] = {value: dupValues[i]};

        for (let i =  0; i < data.length; i++) {
            values.push({value: data[i].value});
        }

        originalData = JSON.parse(JSON.stringify(data));
        values = shuffle(values);
        data = shuffle(data);

        addWords(".left", currentWord[0], 0);
        addWords(".right", currentWord[1], 1);

        $(".left" ).on('wheel', async function (e) { wheel(e, this, 0) });
        $(".right").on('wheel', async function (e) { wheel(e, this, 1) });

        loader.toggle();
    })
}

const wheel = async (e, obj, i) => {
    if (!scrolling[i] && !done) {
        let dir = Math.sign(e.originalEvent.wheelDelta);

        let two = keepValue && i == 1 ? dupValues.length < 3 : data.length < 3;
        if (two) {
            if($(obj).find(".top").length == 0 && dir == -1) {
                return;
            } else if ($(obj).find(".bottom").length == 0 && dir == 1) {
                return;
            }
        }

        currentWord[i] += dir;
        scrolling[i] = true;
        await scrollToWord(currentWord[i], dir, obj, i, false, data.length >= 3);
        scrolling[i] = false;
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

const scrollToWord = async (index, dir, parent, type, reset, generate) => {
    if (keepValue && type == 1) {
        if (dupValues.length < 3) {
            await view.updatePair(getWord(index, type), getWord(index - 1, type), getWord(index + 1, type), dir, parent, type, reset, false);
        } else {
            await view.updatePair(getWord(index, type), getWord(index - 1, type), getWord(index + 1, type), dir, parent, type, reset, false);
        }
    } else {
        await view.updatePair(getWord(index, type), getWord(index - 1, type), getWord(index + 1, type), dir, parent, type, reset, generate);
    }
}

const check = async () => {
    view.flashCircle();
    scrolling = [true, true];

    if (getWord(currentWord[0], 0).value == getWord(currentWord[1], 1).value) {
        view.toggleFlash("green");
        view.updateStatus();

        data.splice(data.indexOf(getWord(currentWord[0])), 1);
        values.splice(values.indexOf(getWord(currentWord[1], 1)), 1);
        view.deletePair();
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
                break;
            }
        }
    } 
    else {
        view.toggleFlash("red");
        await view.shake();
    }
    if (keepValue) scrolling = [true, false];
    
    await timeout(900);
    scrolling = [false, false];
}

const getWord = (newIndex, type) => {
    let length  = (type == 1 && keepValue) ? dupValues.length : data.length;
    if (type == 1 && !keepValue) length = values.length;
    newIndex    %= length;
    
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