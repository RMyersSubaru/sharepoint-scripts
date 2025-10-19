function htmlMaxHeight() {
    contentMaxHeight();
}

function waitForElm(selector, callback) {
    callback();
    return new Promise(resolve => {
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                callback();
                observer.disconnect();
                resolve();
            }
        });

        observer.observe(document.body, {
            childList: true
        });
    });
}

/* Makes Code in Sharepoint Box Max Height */
function contentMaxHeight() {

    //Remove scroll jittering due to SharePoint changing size of header
    document.querySelector('[data-automation-id="contentScrollRegion"]').style.overflow = "unset";
    document.querySelector('[data-automation-id="contentScrollRegion"]').parentElement.style.overflow = "auto";

    //Confirms all elements are max width/height so HTML content can take up max space
    let currentElement = document.getElementById("spPageCanvasContent");
    if (currentElement != null) {
        do {
            currentElement.style.width = "100%";
            currentElement.style.height = "100%";
            currentElement.style.margin = "0px";
            currentElement.style.padding = "0px";
            currentElement = currentElement.firstElementChild;
        } while (!currentElement.hasAttribute("data-sp-feature-tag") || !currentElement.getAttribute("data-sp-feature-tag").toUpperCase().includes("HTMLTEXTEDITOR"));
        currentElement.style.width = "fit-content";
        currentElement.style.minWidth = "100%";
        currentElement.style.height = "100%";
        currentElement.style.margin = "0px";
        currentElement.style.padding = "0px";
    }

    //Removes Comments and Site Footer (If not on screen due to HTML overflow)
    checkIfExistsAndUpdateStyle('[data-viewport-id^="Page.CommentsWrapper.internal"]', 'height: 0px');
    checkIfExistsAndUpdateStyle('[data-viewport-id^="Page.SiteFooter.internal"]', 'width: 100%; min-height: 0px; flex: 0 0 auto;');
}

function checkIfExistsAndUpdateStyle(selector, style) {
    if (document.querySelector(selector) != null) {
        document.querySelector(selector).style = style;
    }
}

//Hides HTML Editor if User not in groupsWithAccess Array
async function hasAccessToContent(groupsWithAccess) {
    let rawResponse = await fetch("https://subaruofindiana.sharepoint.com/sites/HRHub/_api/SP.Publishing.SitePageService.GetCurrentUserMemberships?scenario=%27QuickLinks%27", {
        headers: {
            'Accept': 'application/json'
        }
    });

    let hasAccess = false;

    const listContent = await rawResponse.json();

    for (let i = 0; i < groupsWithAccess.length; i++) {
        if (listContent["value"].includes(groupsWithAccess[i])) {
            hasAccess = true;
            break;
        }
    }

    if (!hasAccess) {
        document.querySelector('script[src*="GlobalHelperFunctions.js"]').parentElement.parentElement.parentElement.parentElement.innerHTML = "";
    }
}