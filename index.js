import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { grammer } from './dataset.js';

const app = express();
const port = process.env.PORT || 3001;

// Define the target word
const targetWord = "ivory";

// Define GA parameters
const populationSize = 3000;
const mutationRate = 0.3;
const maxGenerations = 6;

// Define the dataset of 5-letter words
const wordDataset = grammer;

// Select a random word from the dataset
function getRandomWord() {
    return wordDataset[Math.floor(Math.random() * wordDataset.length)];
}

// Calculate fitness for a word guess (compare to targetWord)
function calculateFitness(wordGuess) {
    let fitness = 0;

    for (let i = 0; i < wordGuess.length; i++) {
        if (wordGuess[i] === targetWord[i]) {
            fitness += 1; // Green: Correct letter in the correct position
        } else if (targetWord.includes(wordGuess[i])) {
            fitness += 0.5; // Yellow: Correct letter in the wrong position
        }
        // Silver letters (not in targetWord) do not contribute to fitness
    }

    return fitness;
}


// Create an initial population of word guesses
function initializePopulation() {
    const population = [];
    for (let i = 0; i < populationSize; i++) {
        population.push(getRandomWord());
    }
    return population;
}

// Perform mutation on a word guess
function mutate(wordGuess) {
    // Choose a random index in the word guess
    const mutationIndex = Math.floor(Math.random() * wordGuess.length);

    // Generate a random letter to replace the letter at the chosen index
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const mutationLetter = alphabet[Math.floor(Math.random() * alphabet.length)];

    // Create a mutated guess by replacing the letter at the mutationIndex
    const mutatedGuess = wordGuess.split(""); // Convert the word to an array of letters
    mutatedGuess[mutationIndex] = mutationLetter; // Replace the letter
    return mutatedGuess.join(""); // Convert the array back to a word
}


// Main GA loop
function runGA() {
    let population = initializePopulation();
    let generations = 0;
    let aiGuess = "";

    while (generations < maxGenerations && aiGuess !== targetWord) {
        // Calculate fitness for each guess in the population
        const fitnessScores = population.map(wordGuess => calculateFitness(wordGuess));

        // Find the best guess in the population
        const bestGuessIndex = fitnessScores.indexOf(Math.max(...fitnessScores));
        aiGuess = population[bestGuessIndex];

        // Mutate some guesses for diversity
        for (let i = 0; i < populationSize; i++) {
            if (Math.random() < mutationRate) {
                population[i] = mutate(population[i]);
            }
        }

        generations++;
    }
    console.log(aiGuess + " " + generations)
    return aiGuess;
}

app.use(cors());
app.use(bodyParser.json());

app.post('/guess', (req, res) => {
    const aiGuess = runGA();
    res.json({ aiGuess });
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
