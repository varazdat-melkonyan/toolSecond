const view = {
    correct: 0,
    row: `<div class="row"></div>`,

    addPair: async (current, top, bottom, parent, type) => {
        let currentText = type == 0 ? current.text  : current.value;
        let bottomText  = type == 0 ? bottom.text   : bottom.value;
        let topText     = type == 0 ? top.text      : top.value;

        if (keepValue && type == 1) {
            $(parent).append(`<div class="current word"><p>${currentText}</p></div>`);
            $(parent).append(`<div class="bottom word"><p>${bottomText}</p></div>`);
        } else {
            $(parent).append(`<div class="top word"><p>${topText}</p></div>`);
            $(parent).append(`<div class="current word"><p>${currentText}</p></div>`);
            $(parent).append(`<div class="bottom word"><p>${bottomText}</p></div>`);
        }
        view.fitText(".word", 20);
    },
    scrollSign: async(direction) => {
        let offset = direction > 0 ? "+=77" : "-=77";
        $(".sign").css("top", offset);
    },
    updatePair: async (current, top, bottom, dir, parent, type, reset, generate) => {
        let currentText = type == 0 ? current.text  : current.value;
        let bottomText  = type == 0 ? bottom.text   : bottom.value;
        let topText     = type == 0 ? top.text      : top.value;

        if (reset === undefined || reset === false) {
            $(parent).find(dir < 0 ? ".bottom" : ".top").addClass(dir < 0 ? "offscreenBottom" : "offscreenTop");
        }

        $(parent).find(".current").addClass(dir < 0 ? "bottom" : "top");
        $(parent).find(".current").removeClass("current");

        $(parent).find(dir < 0 ? ".top" : ".bottom").addClass("current");
        $(parent).find(dir < 0 ? ".top" : ".bottom").removeClass(dir < 0 ? "top" : "bottom");
        if (data.length >= 3) {
            $(parent).find(".current p").text(currentText);
        }

        if (generate) {
            if (dir < 0) {
                $(parent).find(".current").before(`<div class="offscreenTop word"><p>${topText}</p></div>`);
            } else {
                $(parent).find(".current").after(`<div class="offscreenBottom word"><p>${bottomText}</p></div>`);
            }
        }

        view.fitText(".word", 20);

        signShuff = shuffle(signShuff);
        $("#sign_0 p").text(signShuff[2]);
        $("#sign_1 p").text(signShuff[1]);
        $("#sign_2 p").text(signShuff[0]);
        $(".sign").css("opacity", "1");
        
        await timeout(200);
        $(parent).find(dir < 0 ? ".offscreenTop" : ".offscreenBottom").addClass(dir < 0 ? "top" : "bottom");
        $(parent).find(dir < 0 ? ".offscreenTop" : ".offscreenBottom").removeClass(dir < 0 ? "offscreenTop" : "offscreenBottom");

        await timeout (600);
        if (!keepValue || (keepValue && type == 0))
            $(parent).find(dir < 0 ? ".bottom p" : ".top p").text(dir < 0 ? bottomText : topText);

        view.fitText(".word", 20);
        
        $(parent).find(dir < 0 ? ".offscreenBottom" : ".offscreenTop").remove();

        $(".word p").css("font-size", "+=0.01");
        if (reset == true) $(".goLeft").remove(); $(".goRight").remove();
    },
    secondLastScroll: async (parent) => {
        $(".sign").css("opacity", "1");
        if (keepValue && parent == ".right") return;
        
        $(parent + " .top").addClass("current");
        $(parent + " .top").removeClass("top");
        $(parent + " .goLeft" ).remove();
        $(parent + " .goRight").remove();
        view.fitText(".word", 20);
    },
    lastScroll: async () => {
        $(".sign").css("opacity", "1");
        $(".left div").addClass("current");
        $(".left div").removeClass("top bottom");

        if (!keepValue) {
            $(".right div").addClass("current");
            $(".right div").removeClass("top bottom");
        }
        view.fitText(".word", 20);
    },
    toggleFlash: async(color) => {
		$(`#${color}`).css("opacity", 1);
		await timeout(500);
		$(`#${color}`).css("opacity", 0);
	},
    flashCircle: async() => {
        $(".circle").css("opacity", 0);
        await timeout(300);
        $(".circle").css("opacity", 1);
    },
    deletePair: () =>{
        $(".left .current").addClass("goLeft");
        if (!keepValue) $(".right .current").addClass("goRight");
    },
    shake: async () => {
        $(".sign").addClass("shake");
        await timeout(820);
        $(".sign").removeClass("shake");
    },
    end: async () => {
        await timeout(200);
        let classes = [".left", ".right", ".leftOverlay", ".rightOverlay"];

        for (let i = 0; i < classes.length; i++) {
            $(classes[i]).addClass("closed");
            $(".signs").css("display", "none");
            $(".signsOverlay").css("display", "none");
        }

        await timeout(1000);
        $(".outcome").show();
        $(".outcome").addClass("showOutcome");
        $(".outcomeOverlay").addClass("showOutcome");
        $(".outcomeOverlay").show();

        let rowCount = Math.ceil(originalData.length / 3);
        let itemCount = 0;

        for (let i = 0; i < rowCount; i++) {
            $(".outcome").append(view.row);
            await timeout(20);
            
            for (let j = 0; j < 3; j++) {
                view.createItem($(".row").eq(i), originalData[itemCount].text, originalData[itemCount].value);
                itemCount++;

                if (itemCount == originalData.length) {
                    view.fitText(".textHolder", 0, 0);
                    view.fitText(".valueHolder", 0, 0);
                    break;
                }
            }

            view.fitText(".textHolder", 0, 0);
            view.fitText(".valueHolder", 0, 0);

            await timeout(200);
        }

        $(".outcome").css("overflow", "auto");
    },
    createItem: async (parent, text, value) => {
        let item = `<div class="item">
                        <div class="textHolder">
                            <p>${text}</p>
                        </div>
                        <div class="bar"></div>
                        <div class="valueHolder">
                            <p>${value}</p>
                        </div>
                    </div>`;

        $(parent).append(item);
    },
    fitText: (parent, offset, yOffset) => {
        if (offset == undefined) offset = 0;
        if (yOffset === undefined) {
            yOffset = 22;
        }
		$(parent).each(function () {
			let size;
            let paragraph = $(this).find("p");

			while (paragraph.prop("scrollWidth") > $(this).width() - offset || paragraph.prop("scrollHeight") > $(this).height() - yOffset) {
				size = parseInt(paragraph.css("font-size"), 10);
				paragraph.css("font-size", size - 2);
			}
		});
	},
}