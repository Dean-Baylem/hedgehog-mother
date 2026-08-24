type AppleColor = "red" | "green" | "golden";

const getRandomAppleColor = (): AppleColor => {
    const roll = Math.random() * 100;
    if (roll < 41) return "red";
    if (roll < 81) return "green";
    return "golden";
}

export default getRandomAppleColor;