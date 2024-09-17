export const FemaleParents = Object.freeze([
    "Hannah",
    "Audrey",
    "Jasmine",
    "Giselle",
    "Amelia",
    "Isabella",
    "Zoe",
    "Ava",
    "Camila",
    "Violet",
    "Sophia",
    "Evelyn",
    "Nicole",
    "Ashley",
    "Grace",
    "Brianna",
    "Natalie",
    "Olivia",
    "Elizabeth",
    "Charlotte",
    "Emma",
    "Misty"
] as const);

// Female heads
export const FemaleParentIds = ["21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "45"] as const;

export const MaleParents = Object.freeze([
    "Benjamin",
    "Daniel",
    "Joshua",
    "Noah",
    "Andrew",
    "Juan",
    "Alex",
    "Isaac",
    "Evan",
    "Ethan",
    "Vincent",
    "Angel",
    "Diego",
    "Adrian",
    "Gabriel",
    "Michael",
    "Santiago",
    "Kevin",
    "Louis",
    "Samuel",
    "Anthony",
    "Claude",
    "Niko",
    "John"
] as const);


// Male heads
export const MaleParentIds = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "42", "43", "44"] as const;

export type Parent = typeof MaleParents[number] | typeof FemaleParents[number];