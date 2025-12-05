// Performance optimization utilities for smooth 60fps animations

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Debounce function for input events
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Request animation frame wrapper for smooth animations
export const raf = (callback: () => void): number => {
  return requestAnimationFrame(callback);
};

// Cancel animation frame
export const cancelRaf = (id: number): void => {
  cancelAnimationFrame(id);
};

// Smooth scroll to element
export const smoothScrollTo = (
  element: HTMLElement | string,
  options?: ScrollIntoViewOptions
): void => {
  const target = typeof element === 'string' 
    ? document.querySelector(element) as HTMLElement
    : element;
    
  if (target) {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options
    });
  }
};

// Preload images for better performance
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Preload multiple images
export const preloadImages = (sources: string[]): Promise<void[]> => {
  return Promise.all(sources.map(preloadImage));
};

// Check if element is in viewport
export const isInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Lazy load images with intersection observer
export const lazyLoadImage = (
  img: HTMLImageElement,
  src: string,
  options?: IntersectionObserverInit
): void => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        img.src = src;
        img.classList.remove('loading');
        observer.unobserve(img);
      }
    });
  }, options);

  observer.observe(img);
};

// Optimize animation performance
export const optimizeAnimation = (element: HTMLElement): void => {
  // Enable hardware acceleration
  element.style.willChange = 'transform, opacity';
  element.style.transform = 'translateZ(0)';
  
  // Clean up after animation
  const cleanup = () => {
    element.style.willChange = 'auto';
    element.style.transform = '';
  };
  
  // Auto cleanup after 5 seconds
  setTimeout(cleanup, 5000);
};

// Measure performance
export const measurePerformance = (name: string, fn: () => void): void => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Adaptive animation based on user preference
export const adaptiveAnimation = (
  element: HTMLElement,
  animationClass: string,
  fallbackClass?: string
): void => {
  if (prefersReducedMotion()) {
    if (fallbackClass) {
      element.classList.add(fallbackClass);
    }
  } else {
    element.classList.add(animationClass);
  }
};

// FPS monitor for development
export class FPSMonitor {
  private frames = 0;
  private startTime = performance.now();
  private fps = 0;
  private callback?: (fps: number) => void;
  private animationId?: number;

  constructor(callback?: (fps: number) => void) {
    this.callback = callback;
  }

  start(): void {
    const tick = () => {
      this.frames++;
      const currentTime = performance.now();
      
      if (currentTime >= this.startTime + 1000) {
        this.fps = Math.round((this.frames * 1000) / (currentTime - this.startTime));
        
        if (this.callback) {
          this.callback(this.fps);
        }
        
        this.frames = 0;
        this.startTime = currentTime;
      }
      
      this.animationId = requestAnimationFrame(tick);
    };
    
    tick();
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  getFPS(): number {
    return this.fps;
  }
}

// Memory usage monitor
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export const getMemoryUsage = (): MemoryInfo | null => {
  if ('memory' in performance) {
    return (performance as any).memory;
  }
  return null;
};

// Batch DOM operations for better performance
export const batchDOMOperations = (operations: (() => void)[]): void => {
  requestAnimationFrame(() => {
    operations.forEach(operation => operation());
  });
};