import Memoize from 'memoizejs';

export const getPixelCounter = Memoize((pixels, callback) => {
  let counter = 0;

  for (let i = 256320; i < 335120; i+=4) {
    const pixel = {
      r: pixels[i],
      g: pixels[i+1],
      b: pixels[i+2],
      a: pixels[i+3]
    };

    if (callback(pixel)) counter += 1;
  }

  return counter;
});

export const getPercent = Memoize((portion, total) => 100 - Math.ceil(portion / total * 100)); 

// From underscrore.js
export const debounce = (func, wait, immediate) => {
  let timeout;
  return function() {
    let args = arguments;
    let later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  }
}