export const HAPPY_QUOTES = [
    "Happiness depends upon ourselves. — Aristotle",
    "Happiness is the best makeup. — Drew Barrymore",
];

export const SAD_QUOTES = [
    "Tears come from the heart and not from the brain. — Leonardo da Vinci",
    "Every human walks around with a certain kind of sadness. — Brad Pitt",
];

export function randomHappyQuote() {
    return HAPPY_QUOTES[Math.floor(Math.random() * HAPPY_QUOTES.length)];
}

export function randomSadQuote() {
    return SAD_QUOTES[Math.floor(Math.random() * SAD_QUOTES.length)];
}
