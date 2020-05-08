(function() {
  'use strict';
  let sections = [];
  const level = window.level || 2;
  const sectionSelector = range(1, level)
    .map(i => `.article-content h${i}`)
    .join(', ');

  function getPosition(element) {
    let distance = -120;
    while (element) {
      distance += element.offsetTop;
      element = element.offsetParent;
    }
    return distance;
  }

  function calculate() {
    const elements = document.querySelectorAll(sectionSelector);
    sections = Array.from(elements)
      .filter(e => e.id)
      .map(e => ({ id: e.id, pos: getPosition(e) }))
      .sort((a, b) => a.pos - b.pos);
  }

  function markStickyNavElem(elementId) {
    const currentActive = document.querySelector('.active');
    const newActive = document.querySelector(`a[href="#${elementId}"]`);

    if (currentActive === newActive) {
      return;
    }

    if (currentActive) {
      currentActive.setAttribute('class', ' ');
    }

    if (newActive) {
      newActive.setAttribute('class', 'active');
    }
  }

  function getFirstNavElementInView(scrollPosition) {
    // find the last element that is before the scrollPosition
    return sections.reduce(
      (result, current) => (current.pos <= scrollPosition ? current : result),
      null
    );
  }

  function marker() {
    const scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
    const documentHeight = document.documentElement.offsetHeight;
    let newActive = null;

    //if scrolled to the bottom
    if (Math.ceil(scrollPosition + window.innerHeight) >= documentHeight) {
      newActive = sections[sections.length - 1];
    } else {
      newActive = getFirstNavElementInView(scrollPosition);
    }

    if (newActive) {
      markStickyNavElem(newActive.id);
    }
  }

  window.addEventListener('load', function() {
    calculate();
    markStickyNavElem(sections[0].id);
    marker();
  });

  window.addEventListener('resize', function() {
    calculate();
    marker();
  });

  window.addEventListener('scroll', function() {
    marker();
  });
})();
