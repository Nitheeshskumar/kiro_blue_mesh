import { BrandStory } from '../types/brandStory.types';

export const brandStoryData: BrandStory = {
  hero: {
    title: "A Journey of Dreams, Passion & Purpose",
    subtitle: "This journey began in 2018, with a 20-year-old girl and a heart full of dreams. What started as a simple passion — designing and stitching dresses for herself — soon grew into something much bigger. Today, every piece you see here carries a story of love, patience, craftsmanship, and dreams that never gave up.",
    backgroundImage: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
  },
  timeline: [
    {
      id: "1",
      year: 2018,
      title: "The Dream Begins",
      description: "A 20-year-old girl with a heart full of dreams starts designing and stitching dresses for herself, sharing her creativity on Instagram.",
      image: "/assets/images/2018.jpg",
      milestone: true
    },
    {
      id: "2",
      year: 2019,
      title: "First Orders & Growing Confidence",
      description: "Friends and well-wishers begin placing orders. With every small appreciation, confidence grows stronger.",
      image: "/assets/images/2019.jpg",
      milestone: false
    },
    {
      id: "3",
      year: 2020,
      title: "Formal Education & Teaching",
      description: "Completed Diploma in Fashion Design Technology and began working as Fashion Designing Faculty in a renowned college.",
      image: "/assets/images/2020.jpg",
      milestone: true
    },
    {
      id: "4",
      year: 2021,
      title: "Post-Graduation & Expertise",
      description: "Completed Post-Graduation in Fashion Design Technology, deepening knowledge while sharing expertise with students.",
      image: "/assets/images/2021.jpg",
      milestone: false
    },
    {
      id: "5",
      year: 2023,
      title: "Motherhood & New Perspective",
      description: "Life took a beautiful turn with motherhood. A career break to care for the newborn brought new clarity and purpose.",
      image: "/assets/images/2022.jpg",
      milestone: true
    },
    {
      id: "6",
      year: 2023,
      title: "Choosing Passion Over Convention",
      description: "Standing at a crossroads, the choice was made - follow passion over conventional career. Restarted dressmaking, creating beautiful outfits for the little one.",
      image: "/assets/images/2023.jpg",
      milestone: true
    },
    {
      id: "7",
      year: 2024,
      title: "Global Recognition & Purpose",
      description: "Orders started flowing from the city, then other states, and eventually from across the world. The realization dawned - passion had become purpose.",
      image: "/assets/images/2024.jpg",
      milestone: true
    },
    {
      id: "8",
      year: 2025,
      title: "The Website is Born",
      description: "With encouragement from a true well-wisher, this website was born. Every piece here carries a story of love, patience, craftsmanship, and dreams that never gave up.",
      image: "/assets/images/2025.jpg",
      milestone: true
    }
  ],
  values: [
    {
      id: "1",
      title: "Love & Passion",
      description: "Every piece is created with immense love for fashion and an unwavering passion that has guided this journey since 2018.",
      icon: "❤️",
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "2",
      title: "Patience & Craftsmanship",
      description: "Each design is meticulously crafted with patience, attention to detail, and years of honed expertise in fashion design.",
      icon: "✨",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "3",
      title: "Dreams That Never Give Up",
      description: "Built on the foundation of dreams that persevered through every challenge, turning passion into purpose.",
      icon: "🌟",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "4",
      title: "Personal Touch",
      description: "From designing for herself to creating for customers worldwide, every piece carries a personal story and connection.",
      icon: "🎨",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ],
  team: [
    {
      id: "1",
      name: "Banu Nazir Maheen",
      role: "Founder & Creative Director",
      bio: "The heart and soul behind Willowbrook. Starting her journey at 20 with just dreams and passion, Banu has transformed her love for fashion into a purpose that serves customers worldwide. A mother, educator, and designer who chose to follow her heart over convention.",
      image: "/assets/images/founder.jpg",
      isFounder: true
    }
  ]
};