/* ============================================================
   KT WIRZADE - Main Site Script
   ============================================================ */
(function () {
  "use strict";

   /* ----------------------------------------------------------
      1. BOOT LOADER
      Auto-dismiss after ~2s with fade-out animation.
      ---------------------------------------------------------- */
   var boot = document.getElementById("boot");
   if (boot && !boot.dataset.killed) {
     var fill = document.getElementById("boot-fill");
     var pct = document.getElementById("boot-pct");
     var t0 = Date.now();
     var iv = setInterval(function () {
       var el = Date.now() - t0;
       var p = Math.min(100, Math.round(el / 1700 * 100));
       if (fill) fill.style.width = p + "%";
       if (pct) pct.textContent = p + "%";
       if (p >= 100) clearInterval(iv);
     }, 50);
     setTimeout(function () { boot.classList.add("done"); }, 1900);
     setTimeout(function () { if (boot && boot.parentNode) boot.remove(); }, 2500);
   }

  /* ----------------------------------------------------------
     2. NAVBAR SCROLL EFFECT
     Add class 'solid' to #nav when scroll > 50px for blur effect.
     Also update scroll progress bar width.
     ---------------------------------------------------------- */
  var nav = document.getElementById("nav") || document.querySelector(".nav");
  var progressContainer = null;
  var progressBar = null;

  function createProgressBar() {
    progressContainer = document.createElement("div");
    progressContainer.style.cssText =
      "position:fixed;top:0;left:0;right:0;height:2px;z-index:101;" +
      "background:rgba(42,32,48,.4);pointer-events:none;opacity:0;" +
      "transition:opacity .3s ease;";
    progressBar = document.createElement("div");
    progressBar.style.cssText =
      "height:100%;width:0;background:linear-gradient(90deg,#dc2626,#ef4444);" +
      "border-radius:0 2px 2px 0;transition:width .1s linear;";
    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);
  }

  createProgressBar();

  function onNavbarScroll() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    if (nav) {
      if (scrollY > 50) {
        nav.classList.add("solid");
      } else {
        nav.classList.remove("solid");
      }
    }

    if (progressBar && progressContainer) {
      progressBar.style.width = scrollPercent + "%";
      progressContainer.style.opacity = scrollY > 10 ? "1" : "0";
    }
  }

  window.addEventListener("scroll", onNavbarScroll, { passive: true });
  onNavbarScroll();

  /* ----------------------------------------------------------
     3. HAMBURGER MENU
     Toggle mobile nav on click, close on link click.
     ---------------------------------------------------------- */
  var burger = document.getElementById("burger");
  var navlinks = document.getElementById("navlinks");

  /* Tailwind usa a classe "hidden" (display:none) para esconder o menu em
     desktop; ela sobrevive no mobile, entao o toggle precisa remove-la
     manualmente para o dropdown aparecer. */
  function setMenuOpen(open) {
    navlinks.classList.toggle("open", open);
    navlinks.classList.toggle("hidden", !open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (burger && navlinks) {
    burger.addEventListener("click", function () {
      setMenuOpen(!navlinks.classList.contains("open"));
    });

    var navLinkItems = navlinks.querySelectorAll("a");
    navLinkItems.forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });

    document.addEventListener("click", function (e) {
      if (
        navlinks.classList.contains("open") &&
        !navlinks.contains(e.target) &&
        !burger.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    });
  }

  /* ----------------------------------------------------------
     4. REVEAL ON SCROLL
     IntersectionObserver for [data-reveal] and .reveal elements.
     Supports data-reveal="left", "right", "scale" variants.
     ---------------------------------------------------------- */
  var revealIO = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var variant = el.getAttribute("data-reveal") || "";
          el.classList.add("visible");
          el.classList.add("on");
          if (variant) {
            el.classList.add("reveal-" + variant);
          }
          revealIO.unobserve(el);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    revealIO.observe(el);
  });

  document.querySelectorAll(".reveal").forEach(function (el) {
    if (!el.hasAttribute("data-reveal")) {
      revealIO.observe(el);
    }
  });

  /* ----------------------------------------------------------
     5. COUNTER ANIMATION
     Animate from 0 to target with easing, respecting data-suffix.
     ---------------------------------------------------------- */
  var counterIO = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        counterIO.unobserve(el);

        var target = parseInt(el.getAttribute("data-count"), 10) || 0;
        var suffix = el.getAttribute("data-suffix") || "";
        var duration = 1200;
        var startTime = null;

        function easeOutCubic(t) {
          return 1 - Math.pow(1 - t, 3);
        }

        function animateCounter(timestamp) {
          if (!startTime) startTime = timestamp;
          var elapsed = timestamp - startTime;
          var progress = Math.min(elapsed / duration, 1);
          var easedProgress = easeOutCubic(progress);
          var current = Math.round(target * easedProgress);
          el.textContent = current + suffix;
          if (progress < 1) {
            requestAnimationFrame(animateCounter);
          }
        }

        requestAnimationFrame(animateCounter);
      });
    },
    { threshold: 0.4 }
  );

  document.querySelectorAll("[data-count]").forEach(function (el) {
    counterIO.observe(el);
  });

  /* ----------------------------------------------------------
     6. 3D TILT EFFECT
     On mousemove for .feature-card-dark, .shot, .term elements,
     apply perspective transform based on cursor position.
     Reset on mouseleave.
     ---------------------------------------------------------- */
  var tiltElements = document.querySelectorAll(
    ".feature-card-dark, .shot, .term"
  );

  tiltElements.forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = ((y - centerY) / centerY) * -4;
      var rotateY = ((x - centerX) / centerX) * 4;
      card.style.transform =
        "perspective(700px) rotateX(" + rotateX +
        "deg) rotateY(" + rotateY + "deg) translateY(-4px)";
    });

    card.addEventListener("mouseleave", function () {
      card.style.transform = "";
    });
  });

  /* ----------------------------------------------------------
     7. LANGUAGE BAR ANIMATION
     IntersectionObserver for .lang-panel, add 'lang-on' class
     to trigger segment animations.
     ---------------------------------------------------------- */
  document.querySelectorAll(".lang-panel").forEach(function (panel) {
    var langIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            panel.classList.add("lang-on");
            langIO.unobserve(panel);
          }
        });
      },
      { threshold: 0.4 }
    );
    langIO.observe(panel);
  });

  /* ----------------------------------------------------------
     8. COMPARISON TABLE GLOW
     Create a glow div that follows mouse cursor inside .cmp-wrap.
     ---------------------------------------------------------- */
  var cmpWrap = document.querySelector(".cmp-wrap");
  if (cmpWrap) {
    var glow = document.createElement("div");
    glow.className = "cmp-glow";
    cmpWrap.appendChild(glow);

    cmpWrap.addEventListener("mousemove", function (e) {
      var rect = cmpWrap.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      glow.style.left = x + "px";
      glow.style.top = y + "px";
    });
  }

  /* ----------------------------------------------------------
     9. SMOOTH SCROLL
     For all anchor links with href starting with #.
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = anchor.getAttribute("href");
      if (!href || href.length < 2) return;

      var target = null;
      try {
        target = document.querySelector(href);
      } catch (err) {
        return;
      }

      if (target) {
        e.preventDefault();
        var navHeight = nav ? nav.offsetHeight : 0;
        var targetPosition = target.getBoundingClientRect().top +
          window.pageYOffset - navHeight - 10;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        });

        if (history.pushState) {
          history.pushState(null, null, href);
        }
      }
    });
  });

  /* ----------------------------------------------------------
     10. COPY CODE
     For .copy-btn elements, copy code content to clipboard,
     show check icon temporarily.
     ---------------------------------------------------------- */
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var codeBlock = btn.closest(".code-block") ||
        btn.parentElement.querySelector("code") ||
        btn.parentElement.querySelector("pre");
      if (!codeBlock) return;

      var text = codeBlock.textContent || codeBlock.innerText;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showCopiedFeedback(btn);
        }).catch(function () {
          fallbackCopy(text, btn);
        });
      } else {
        fallbackCopy(text, btn);
      }
    });
  });

  function fallbackCopy(text, btn) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText = "position:fixed;left:-9999px;top:-9999px;";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showCopiedFeedback(btn);
    } catch (err) {
      /* silent fail */
    }
    document.body.removeChild(textarea);
  }

  function showCopiedFeedback(btn) {
    var originalHTML = btn.innerHTML;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    btn.classList.add("copied");
    setTimeout(function () {
      btn.innerHTML = originalHTML;
      btn.classList.remove("copied");
    }, 1800);
  }

  /* ----------------------------------------------------------
     11. FAQ ACCORDION
     Toggle .open class on .faq-item on click, close others.
     Works with both <details> and div-based accordion.
     ---------------------------------------------------------- */
  var faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(function (item) {
    if (item.tagName === "DETAILS") {
      item.addEventListener("toggle", function () {
        if (item.open) {
          faqItems.forEach(function (other) {
            if (other !== item && other.tagName === "DETAILS" && other.open) {
              other.open = false;
            }
            if (other !== item) {
              other.classList.remove("open");
            }
          });
          item.classList.add("open");
        } else {
          item.classList.remove("open");
        }
      });
    } else {
      var summary = item.querySelector("summary");
      var trigger = summary || item;
      trigger.addEventListener("click", function (e) {
        if (e.target.tagName === "A") return;
        e.preventDefault();
        var isOpen = item.classList.contains("open");
        faqItems.forEach(function (other) {
          other.classList.remove("open");
        });
        if (!isOpen) {
          item.classList.add("open");
        }
      });
    }
  });

  /* ----------------------------------------------------------
     12. TOOLSET FEATURES STAGGER
     IntersectionObserver for .toolset-feats li, animate opacity
     and translateX with staggered delays.
     ---------------------------------------------------------- */
  var toolsetItems = document.querySelectorAll(".toolset-feats li");

  toolsetItems.forEach(function (li, index) {
    li.style.opacity = "0";
    li.style.transform = "translateX(-20px)";
    li.style.transition =
      "opacity .4s ease " + (index * 0.08) +
      "s, transform .4s ease " + (index * 0.08) + "s";
  });

  var toolsetIO = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          toolsetItems.forEach(function (li) {
            li.style.opacity = "1";
            li.style.transform = "translateX(0)";
          });
          toolsetIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  var toolsetContainer = document.querySelector(".toolset-feats");
  if (toolsetContainer) {
    toolsetIO.observe(toolsetContainer);
  }

  /* ----------------------------------------------------------
     13. FEATURE CARDS STAGGER
     IntersectionObserver for .feature-card-dark, animate opacity
     and translateY with staggered delays.
     ---------------------------------------------------------- */
  var featureCards = document.querySelectorAll(".feature-card-dark");

  featureCards.forEach(function (card, index) {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition =
      "opacity .5s ease " + (0.1 + index * 0.12) +
      "s, transform .5s ease " + (0.1 + index * 0.12) + "s";
  });

  var featureCardsIO = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          featureCards.forEach(function (card) {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          });
          featureCardsIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  var featuresGrid = document.querySelector(".features-grid");
  if (featuresGrid) {
    featureCardsIO.observe(featuresGrid);
  }

  /* ----------------------------------------------------------
     14. ACTIVE NAV LINK
     Highlight current section in nav on scroll.
     ---------------------------------------------------------- */
  var navLinkElements = document.querySelectorAll(".nav-links a[href^='#']");
  var sectionMap = [];

  navLinkElements.forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href || href.length < 2) return;
    try {
      var section = document.querySelector(href);
      if (section) {
        sectionMap.push({ link: link, section: section });
      }
    } catch (err) {
      /* skip invalid selectors */
    }
  });

  function updateActiveNavLink() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var viewportHeight = window.innerHeight;
    var currentSection = null;

    for (var i = sectionMap.length - 1; i >= 0; i--) {
      var secTop = sectionMap[i].section.getBoundingClientRect().top;
      if (secTop <= viewportHeight * 0.4) {
        currentSection = sectionMap[i];
        break;
      }
    }

    sectionMap.forEach(function (item) {
      item.link.classList.remove("active");
    });

    if (currentSection) {
      currentSection.link.classList.add("active");
    }
  }

  window.addEventListener("scroll", updateActiveNavLink, { passive: true });
  updateActiveNavLink();

  /* ----------------------------------------------------------
     15. PARALLAX EFFECT
     On scroll, move parallax layers at different speeds.
     Looks for [data-parallax-speed] elements or falls back to
     hero-grid and hero-in as parallax layers.
     ---------------------------------------------------------- */
  var parallaxLayers = document.querySelectorAll("[data-parallax-speed]");
  var heroGrid = document.querySelector(".hero-grid");
  var heroIn = document.querySelector(".hero-in");

  function onParallaxScroll() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;

    parallaxLayers.forEach(function (layer) {
      var speed = parseFloat(layer.getAttribute("data-parallax-speed")) || 0.3;
      layer.style.transform = "translateY(" + (scrollY * speed) + "px)";
    });

    if (heroGrid) {
      heroGrid.style.transform = "translateY(" + (scrollY * 0.15) + "px)";
    }
    if (heroIn) {
      heroIn.style.transform = "translateY(" + (scrollY * 0.08) + "px)";
    }
  }

  window.addEventListener("scroll", onParallaxScroll, { passive: true });
  onParallaxScroll();

  /* ----------------------------------------------------------
     16. NAV PROGRESS BAR (estilo KT APBX)
     ---------------------------------------------------------- */
  var navProgress = document.getElementById("nav-progress");
  if (navProgress) {
    function updateNavProgress() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      navProgress.style.width = pct + "%";
    }
    window.addEventListener("scroll", updateNavProgress, { passive: true });
    updateNavProgress();
  }

  /* ----------------------------------------------------------
     17. TOOLSET YAML - stagger reveal + glow mouse
     ---------------------------------------------------------- */
  var toolsetCol = document.querySelector(".toolset-features-col");
  if (toolsetCol) {
    var tIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          toolsetCol.classList.add("ready");
          tIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    tIO.observe(toolsetCol);

    toolsetCol.querySelectorAll(".toolset-feature").forEach(function (f) {
      f.addEventListener("mousemove", function (e) {
        var r = f.getBoundingClientRect();
        f.style.setProperty("--mx", (e.clientX - r.left) + "px");
        f.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ----------------------------------------------------------
     18. CHANGELOG PROGRESSION
     ---------------------------------------------------------- */
  var changelogItems = document.querySelectorAll(".changelog-item");
  if (changelogItems.length) {
    // adiciona index aos <li> para stagger
    changelogItems.forEach(function (item) {
      var lis = item.querySelectorAll(".changelog-changes li");
      lis.forEach(function (li, i) { li.style.setProperty("--i", i); });
      // garante dot
      if (!item.querySelector(".changelog-dot")) {
        var dot = document.createElement("span");
        dot.className = "changelog-dot";
        item.insertBefore(dot, item.firstChild);
      }
    });
    var cIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          cIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    changelogItems.forEach(function (item) { cIO.observe(item); });
  }

})();
