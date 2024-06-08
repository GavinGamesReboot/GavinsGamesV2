elements.mud_brick = {
    color: "#8a6249",
    colorPattern: textures.BRICK,
    colorKey: {
        "r": "#8a6249",
        "w": "#634933"},
    behavior: behaviors.WALL,
    category: "solids",
    state: "solid",
    tempHigh: 1200,
    stateHigh: "molten_dirt",
    hardness: 0.33,
    breakInto: "dirt"
}

var materials = ["brick","concrete","wood","glass","steel"];

elements.tower = {
    color: [],
    behavior: [
        "XX|XX|XX",
        "XX|CH:"+materials.join("_tower,")+"_tower|XX",
        "XX|XX|XX",
    ],
    category: "spawners",
    maxSize: 1,
    cooldown: defaultCooldown,
}

materials.forEach((elem) => {
    if (Array.isArray(elements[elem].color)) {
        elements.tower.color.push(elements[elem].color[0]);
    }
    else {
        elements.tower.color.push(elements[elem].color);
    }
    elements[elem+"_tower"] = {
        color: elements[elem].color,
        behavior: [
            `XX|M2|XX`,
            `XX|C2:${elem}_room|XX`,
            `XX|M1|XX`,
        ],
        maxSize: 1,
        cooldown: defaultCooldown,
        category: "spawners"
    }
    elements[elem+"_room"] = {
        color: elements[elem].color,
        behavior: [
            `XX|XX|CR:${elem}_room,${elem}_room,${elem}_room,${elem}_room,tower_antenna,wood_roof%80|XX|XX`,
            `XX|XX|XX|XX|XX`,
            `CR:${elem}|CR:${elem}|CR:${elem}|CR:${elem}|CR:${elem}`,
            `CR:glass|XX|XX|CR:human%25|CR:glass`,
            `CR:glass|CR:human%25|DL|CR:human%25|CR:glass`,
            `CR:${elem}|XX|XX|XX|CR:${elem}`,
            `CR:${elem}|CR:${elem}|CR:${elem}|CR:${elem}|CR:${elem}`,
            `XX|XX|XX|XX|XX`,
            `XX|XX|XX|XX|XX`
        ],
        maxSize: 1,
        cooldown: defaultCooldown,
        category: "spawners",
        hidden: true
    }
})
elements.tower.color = elements.tower.color.sort();

elements.tower_antenna = {
    color: "#bababa",
    behavior: [
        "CR:steel%30",
        "CR:steel",
        "CR:steel",
        "CR:steel",
        "CH:steel",
        "CR:steel",
        "XX",
        "XX",
        "XX",
        "XX",
    ],
    maxSize: 1,
    cooldown: defaultCooldown,
    category: "spawners",
    hidden: true
}
elements.wood_roof = {
    color: "#965829",
    behavior: [
        "XX|XX|XX|XX|XX|XX|XX",
        "XX|XX|XX|CR:wood|XX|XX|XX",
        "XX|XX|CR:wood|CH:wood|CR:wood|XX|XX",
        "XX|CR:wood|XX|XX|XX|CR:wood|XX",
        "CR:wood|XX|XX|XX|XX|XX|CR:wood",
    ],
    maxSize: 1,
    cooldown: defaultCooldown,
    category: "spawners",
    hidden: true
}



worldgentypes.city = {
    layers: [
        [0.95, "grass"],
        [0.50, "dirt"],
        [0.05, "rock"],
        [0, "basalt"],
    ],
    decor: [ // [element, chance, distance from top]
        ["tower", 0.08],
        // ["bird", 0.025, 10],
    ],
    baseHeight: 0.25
}