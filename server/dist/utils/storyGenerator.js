"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderStory = generateOrderStory;
exports.generateProductOriginStory = generateProductOriginStory;
const brandLore = {
    colorStories: {
        '#000000': [
            'In the depths of midnight, where shadows dance with moonlight',
            'Born from the essence of volcanic obsidian',
            'Inspired by the infinite cosmos and starless nights',
            'Crafted from the mystery of ancient ravens\' wings'
        ],
        '#FFFFFF': [
            'Pure as fresh mountain snow on winter\'s first dawn',
            'Woven from clouds that kiss the highest peaks',
            'Born from the pristine silence of arctic winds',
            'Inspired by the gentle touch of morning mist'
        ],
        '#FF0000': [
            'Forged in the heart of passionate sunsets',
            'Born from the courage of ancient warriors',
            'Inspired by the warmth of crackling hearth fires',
            'Crafted from the essence of blooming roses'
        ],
        '#0000FF': [
            'Deep as the ocean\'s most sacred depths',
            'Born from the wisdom of endless skies',
            'Inspired by the tranquil flow of mountain streams',
            'Woven from the dreams of soaring eagles'
        ],
        '#00FF00': [
            'Fresh as spring\'s first awakening',
            'Born from ancient forest whispers',
            'Inspired by the life force of emerald meadows',
            'Crafted from the hope of new beginnings'
        ]
    },
    sizeStories: {
        'XS': ['this delicate creation was shaped for those who move like gentle breezes'],
        'S': ['this piece was tailored for the swift and graceful'],
        'M': ['this garment found its perfect balance, like harmony in nature'],
        'L': ['this bold creation was designed for those who stand tall like mighty oaks'],
        'XL': ['this powerful piece was crafted for those with hearts as vast as oceans'],
        'XXL': ['this majestic creation was born for those who command presence like mountains']
    },
    embroideryStories: [
        'Each thread tells a story passed down through generations of master artisans',
        'The embroidery carries the whispered dreams of skilled craftspeople',
        'Every stitch holds the magic of ancient textile traditions',
        'The golden threads weave tales of distant lands and forgotten kingdoms'
    ],
    productStories: {
        'shirts': [
            'This shirt began its journey in the Willowbrook atelier, where master tailors',
            'Born in the creative sanctuary of our Willowbrook studio, this shirt',
            'From the hands of passionate Willowbrook artisans, this shirt emerged'
        ],
        'hoodies': [
            'This hoodie was born from Willowbrook\'s dedication to comfort and style, where artisans',
            'In the cozy corners of our Willowbrook workshop, this hoodie took shape as craftspeople',
            'This hoodie emerged from Willowbrook dreams of perfect warmth, where designers'
        ],
        'activewear': [
            'This athletic piece was forged in the Willowbrook performance lab, where function meets artistry as',
            'Born from the Willowbrook spirit of movement and grace, this activewear was crafted where',
            'This performance piece emerged from Willowbrook\'s fusion of function and beauty, where'
        ]
    },
    endings: [
        'Now it awaits to become part of your own unique story.',
        'Ready to accompany you on your next adventure.',
        'Prepared to be the canvas for your personal journey.',
        'Destined to become a cherished part of your wardrobe tale.',
        'Eager to write new chapters alongside you.'
    ]
};
function generateOrderStory(customization) {
    const { color, size, embroidery, productType } = customization;
    // Get random story elements
    const colorStory = getRandomElement(brandLore.colorStories[color] || brandLore.colorStories['#000000']);
    const sizeStory = getRandomElement(brandLore.sizeStories[size] || brandLore.sizeStories['M']);
    const productStory = getRandomElement(brandLore.productStories[productType] || brandLore.productStories['shirts']);
    const ending = getRandomElement(brandLore.endings);
    let story = `${colorStory}, ${productStory} carefully selected each fiber and hue. `;
    story += `With meticulous attention to detail, ${sizeStory}. `;
    if (embroidery) {
        const embroideryStory = getRandomElement(brandLore.embroideryStories);
        story += `${embroideryStory}, spelling out "${embroidery}" with golden precision. `;
    }
    story += ending;
    return story;
}
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function generateProductOriginStory(productName, category) {
    const origins = [
        `The ${productName} traces its lineage to the ancient textile masters of the Silk Road, where`,
        `Born from the creative minds of Renaissance artisans, the ${productName} represents`,
        `Inspired by the nomadic tribes of the northern mountains, this ${productName} embodies`,
        `From the bustling workshops of master craftspeople, the ${productName} emerged as`
    ];
    const qualities = [
        'a perfect blend of comfort and timeless style',
        'the harmony between tradition and modern innovation',
        'the spirit of adventure and refined elegance',
        'a testament to quality craftsmanship and attention to detail'
    ];
    const origin = getRandomElement(origins);
    const quality = getRandomElement(qualities);
    return `${origin} ${quality}. Each piece carries forward this legacy of excellence.`;
}
//# sourceMappingURL=storyGenerator.js.map