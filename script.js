var menus;
var dayIndexSel;

async function fetchPublicDownloadList() {
    let query = `
fragment pointsOfSaleFragment2 on Pos {
    name
    schedules {
        days
        hours
    }
}

query getPos($id: ID!, $days: Int!) {
    getPos(id: $id) {
        ...pointsOfSaleFragment2
        menus(days: $days) {
            day
            elements {
                label
                price {
                    amount
                    currency
                }
                dish {
                    dishGroup {
                        label
                    }
                }
                allergens
                certifications
                products(main: false) {
                    main
                    label
                    certifications
                }
            }
        }
    }
}`;
    const res = await   fetch("https://api.foodi.fr/graphql", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "application/json"
                            },
                            body: JSON.stringify({
                                operationName: "getPos",
                                variables: { id: "695", days: 5 },
                                query: query
                            })
                        })
    return await res.json();
}

function createListItem(headline, text, trailing) {
    const item = document.createElement("md-list-item");

    // headline
    const headlineDiv = document.createElement("div");
    headlineDiv.setAttribute("slot", "headline");
    headlineDiv.textContent = headline;

    // supporting text
    const supportingDiv = document.createElement("div");
    supportingDiv.setAttribute("slot", "supporting-text");
    supportingDiv.textContent = text;

    // trailing text
    const trailingDiv = document.createElement("div");
    trailingDiv.setAttribute("slot", "trailing-supporting-text");
    trailingDiv.className = "md-typescale-display-medium";
    trailingDiv.textContent = trailing;

    // append children
    item.appendChild(headlineDiv);
    item.appendChild(supportingDiv);
    item.appendChild(trailingDiv);

    return item;
}

function nextDay() {
    updateDay(dayIndexSel + 1);
}

function previousDay() {
    updateDay(dayIndexSel - 1);
}

async function updateDay(dayIndex) {
    if (!menus || menus.length === 0) return;
    if (dayIndex < 0 || dayIndex > 4) return;
    if (dayIndex == 0) document.querySelector("md-filled-icon-button.previous").setAttribute("disabled", "");
    if (dayIndex == 4) document.querySelector("md-filled-icon-button.next").setAttribute("disabled", "");
    if (dayIndexSel == 0 || dayIndexSel == 4) {
        const buttons = document.querySelectorAll("md-filled-icon-button");
        buttons.forEach(but => but.removeAttribute("disabled"))
    };

    const wrapper = document.querySelector('div#wrapper');
    Array.from(wrapper.children).forEach(section => {
        const list = section.querySelector('md-list');
        list.innerHTML = "";
    });

    const todayMenu = menus[dayIndex]; // first day for now
    document.querySelector(".currentDay").textContent = todayMenu.day;

    todayMenu.elements.forEach(el => {
        const group = el.dish?.dishGroup?.label?.trim();
        if (!group) return;

        // find the md-list with matching dishGroup
        const list = document.querySelector(`section[dishGroup="${group}"] md-list`);
        if (!list) return;

        // create a new element
        const dishItem = createListItem(el.label, el.description, el.price.amount.toFixed(2)+"€")
        const separator = document.createElement("md-divider");

        list.appendChild(dishItem);
        list.appendChild(separator);
    });

    dayIndexSel = dayIndex;
}

document.addEventListener("DOMContentLoaded", async () => {
    try{
        const json = await fetchPublicDownloadList();
        menus = json.data.getPos.menus;

        menus.sort((a, b) => new Date(a.day) - new Date(b.day));

        updateDay(0);
    } catch (err) {
        console.error("Error loading menu:", err);
    }
});