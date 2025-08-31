export const HAPPY_QUOTES = [
    "Happiness depends upon ourselves. — Aristotle",
    "Happiness is the best makeup. — Drew Barrymore",
    "Happiness is not something ready-made. It comes from your own actions. —Dalai Lama",
    "Some cause happiness wherever they go; others whenever they go. —Oscar Wilde",
];

export const SAD_QUOTES = [
    "Tears come from the heart and not from the brain. — Leonardo da Vinci",
    "Every human walks around with a certain kind of sadness. — Brad Pitt",
    "When you're happy you enjoy the music, but when you're sad you understand the lyrics. - Philip James Bailey.",
    "The walls we build around us to keep sadness out also keeps out the joy. – Jim Rohn",
];

export function randomHappyQuote() {
    return HAPPY_QUOTES[Math.floor(Math.random() * HAPPY_QUOTES.length)];
}

export function randomSadQuote() {
    return SAD_QUOTES[Math.floor(Math.random() * SAD_QUOTES.length)];
}
