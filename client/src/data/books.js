
import book1 from '../assets/book1.png';
import book2 from '../assets/book2.png';
import book3 from '../assets/book3.png';
import book4 from '../assets/book4.png';

export const books = [
    {
        id: 1,
        title: "The Neural Network",
        author: "Dr. Sarah Connor",
        rating: 4.8,
        pages: 324,
        language: "English",
        match: "98%",
        image: book1,
        available: true,
        description: "Unravel the complexities of modern neural networks in this comprehensive guide. Perfect for AI enthusiasts looking to understand the deep learning revolution from the ground up.",
        tags: ["AI", "Deep Learning", "Technology"],
        content: [
            {
                title: "Chapter 1: The Perceptron",
                text: `In the beginning, there was the Perceptron. A single neuron, modeled mathematically to mimic the biological firing of a brain cell. It was simple, elegant, and limited.

The year was 1958 when Frank Rosenblatt introduced this concept at Cornell Aeronautical Laboratory. The press called it the embryo of an electronic computer that [the Navy] expects will be able to walk, talk, see, write, reproduce itself and be conscious of its existence. High expectations for a simple binary classifier.

But the perceptron had a flaw. It couldn't solve non-linear problems. It couldn't even learn the simple XOR function. This limitation, highlighted by Minsky and Papert, sent neural network research into a dark winter that lasted decades.

Yet, like a dormant seed, the idea remained. Waiting for backpropagation. Waiting for computing power. Waiting to blossom into the deep learning revolution we know today.`
            },
            {
                title: "Chapter 2: Hidden Layers",
                text: `The magic happens in the dark. Between the input and the output lies the "hidden layer". Why hidden? Because we don't directly see what it does. We only see the result.

Imagine a neural network trying to recognize a cat. The input layer sees pixels. The output layer says "Cat". But what happens in between?

The first hidden layer might detect edges. Vertical lines, horizontal lines.
The second layer might combine these edges to find shapes. A circle for an eye. A triangle for an ear.
The third layer? It sees a face.

Deep learning is simply the act of stacking these layers deeper and deeper, allowing the machine to learn hierarchical representations of the world. The deeper the network, the more abstract the concepts it can understand.`
            },
            {
                title: "Chapter 3: The Gradient Descent",
                text: `Imagine you are on a mountain, blindfolded. You want to reach the bottom of the valley. How do you do it? You feel the ground with your feet. You take a step in the steepest downward direction.

This is Gradient Descent. The algorithm that powers nearly all modern AI. The 'mountain' is the error landscape—the difference between what the network guessed and the right answer. The 'step' is the update we make to the network's weights.

We calculate the gradient—the slope of the error function—and we move against it. Step by step, iteration by iteration, we descend. Sometimes we get stuck in local minima (small valleys that are not the bottom). Sometimes we overshoot. But with the right learning rate and momentum, we find our way to the solution.`
            }
        ]
    },
    {
        id: 2,
        title: "Cosmic Algorithms",
        author: "Prof. A. Einstein",
        rating: 4.9,
        pages: 412,
        language: "English",
        match: "95%",
        image: book2,
        available: true,
        description: "A journey through the mathematical elegance of the universe. Explore how algorithms shape the cosmos, from the smallest particles to the largest galaxies.",
        tags: ["Physics", "Algorithms", "Cosmology"],
        content: [
            {
                title: "Prologue: The Code of the Cosmos",
                text: `Is the universe a computer? It's a question that has puzzled philosophers and physicists alike. If the laws of physics are mathematical equations, and the universe follows them without fail, is it simply processing data?

Every particle interaction is a calculation. Every force is a variable. Time itself is the clock speed of the cosmic processor.

In this book, we will explore the idea that reality is algorithmic. From the Fibonacci sequence in a sunflower to the fractal patterns of galaxies, we find the same code repeating itself at every scale.`
            },
            {
                title: "Chapter 1: Gravity's Loop",
                text: `Gravity is not a force, said Einstein. It is the curvature of spacetime. But how do we simulate this?

In our cosmic algorithm, gravity acts as the recursive function that binds matter together. Just as a ` + "`while`" + ` loop checks a condition, gravity checks purely for mass. If mass exists, curve space. If space curves, matter moves.

This feedback loop creates stars, which fuse elements, which explode into dust, which forms planets, which might—just might—create observers who can wonder about the code.`
            }
        ]
    },
    {
        id: 3,
        title: "Quantum Dreams",
        author: "R. Feynman",
        rating: 4.7,
        pages: 288,
        language: "English",
        match: "92%",
        image: book3,
        available: false,
        description: "Dive into the surreal world of quantum mechanics. This book bridges the gap between scientific theory and philosophical wonder.",
        tags: ["Quantum Physics", "Science", "Philosophy"],
        content: [
            {
                title: "Chapter 1: The Observer Effect",
                text: `If a tree falls in a forest and no one is there to hear it, does it make a sound? Quantum mechanics asks a stranger question: If a particle has no observer, does it even exist in a definite state?

The double-slit experiment showed us that light behaves as both a wave and a particle. But the moment we measure it, it chooses one. Reality, it seems, waits for an audience.`
            }
        ]
    },
    {
        id: 4,
        title: "Data Structures of Life",
        author: "Alice O. H.",
        rating: 4.6,
        pages: 356,
        language: "English",
        match: "88%",
        image: book4,
        available: true,
        description: "An innovative look at biology through the lens of computer science. Discover the complex data structures that make up living organisms.",
        tags: ["Biology", "Data Structures", "Interdisciplinary"],
        content: [
            {
                title: "Introduction: DNA as a String",
                text: `Deoxyribonucleic acid. DNA. A molecule? Yes. But to a computer scientist, it is a string. A string written in a quaternary alphabet: A, C, G, T.

 Your entire existence is encoded in 3 billion characters. A massive text file without comments, running a program that has been debugging itself for 4 billion years.`
            }
        ]
    }
];
