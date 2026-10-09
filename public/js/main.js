/* ============================================================
   KT WIRZADE - Main Site Script
   ============================================================ */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     0. PLATINUM-STYLE ORGANIC BACKGROUND
     A real animated canvas keeps the same clean visual language as the
     reference: one broad living gradient, black vignette and fine grid.
     ---------------------------------------------------------- */
  function initPlatinumBackground() {
    var canvas = document.getElementById("platinum-webgl");
    if (!canvas) return;
    function useFallback() {
      document.body.classList.add("platinum-fallback");
      canvas.setAttribute("data-fallback", "true");
    }
    var gl = null;
    try {
      gl = canvas.getContext("webgl", { alpha: false, antialias: false }) ||
        canvas.getContext("experimental-webgl", { alpha: false, antialias: false });
    } catch (error) {
      useFallback();
      return;
    }
    if (!gl) {
      useFallback();
      return;
    }

    var vertex = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
    var fragment = "precision mediump float;\n" +
      "uniform vec2 u_res; uniform float u_time;\n" +
      "vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}\n" +
      "vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}\n" +
      "vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}\n" +
      "float snoise(vec2 v){const vec4 C=vec4(0.2113248654,0.3660254038,-0.5773502692,0.0243902439);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;m*=1.7928429-0.8537347*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}\n" +
      "void main(){vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y;float t=u_time*0.08;float n1=snoise(uv*1.4+vec2(t,t*0.6));float n2=snoise(uv*2.2-vec2(t*0.4,t*0.7)+n1*0.6);float n3=snoise(uv*0.7+vec2(-t*0.5,t*0.3)+n2*0.4);vec3 c1=vec3(0.42,0.16,0.72);vec3 c2=vec3(0.035,0.12,0.18);vec3 c3=vec3(0.30,0.48,0.68);vec3 c4=vec3(0.016,0.016,0.020);vec3 col=mix(c4,c1,smoothstep(-0.20,0.66,n1)*0.68);col=mix(col,c2,smoothstep(0.02,0.72,n2)*0.44);col=mix(col,c3,smoothstep(0.30,0.90,n3)*0.20);float v=smoothstep(1.2,0.2,length(uv));col*=mix(0.25,1.0,v);float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);col+=(grain-0.5)*0.018;gl_FragColor=vec4(col,1.0);}";

    function compile(type, source) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    var vert = compile(gl.VERTEX_SHADER, vertex);
    var frag = compile(gl.FRAGMENT_SHADER, fragment);
    if (!vert || !frag) {
      useFallback();
      return;
    }
    var program = gl.createProgram();
    if (!program) {
      useFallback();
      return;
    }
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      useFallback();
      return;
    }
    gl.useProgram(program);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    var resolution = gl.getUniformLocation(program, "u_res");
    var time = gl.getUniformLocation(program, "u_time");
    if (!resolution || !time) {
      useFallback();
      return;
    }
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function (callback) {
      return window.setTimeout(function () { callback(Date.now()); }, 1000 / 30);
    };
    var caf = window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : window.clearTimeout.bind(window);
    var frameId = 0;
    var elapsed = 0;
    var lastFrame = 0;

    function resize() {
      var ratioLimit = window.innerWidth <= 768 ? 1.35 : 1.75;
      var ratio = Math.min(window.devicePixelRatio || 1, ratioLimit);
      canvas.width = Math.max(1, Math.floor(window.innerWidth * ratio));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function frame(now) {
      if (!lastFrame) lastFrame = now;
      elapsed += Math.min(now - lastFrame, 50);
      lastFrame = now;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, reduced ? 0 : elapsed * 0.001);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduced) frameId = raf(frame);
    }
    function stop() {
      if (frameId) caf(frameId);
      frameId = 0;
      lastFrame = 0;
    }
    function start() {
      if (!frameId) frameId = raf(frame);
    }
    canvas.addEventListener("webglcontextlost", function (event) {
      event.preventDefault();
      stop();
      useFallback();
    }, { passive: false });
    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
    if (!document.hidden) start();
  }

  initPlatinumBackground();

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
     The native nav progress element is updated further below.
     ---------------------------------------------------------- */
  var nav = document.getElementById("nav") || document.querySelector(".nav");

  function onNavbarScroll() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;

    if (nav) {
      if (scrollY > 50) {
        nav.classList.add("solid");
      } else {
        nav.classList.remove("solid");
      }
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

  function setMenuOpen(open) {
    navlinks.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    var icon = burger.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-bars", !open);
      icon.classList.toggle("fa-xmark", open);
    }
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

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navlinks.classList.contains("open")) {
        setMenuOpen(false);
        burger.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 720 && navlinks.classList.contains("open")) {
        setMenuOpen(false);
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     4. INTERACTIVE PRODUCT FLOW
     The public page explains one step at a time without hiding content
     from assistive technology or requiring a framework runtime.
     ---------------------------------------------------------- */
  var flowSteps = document.querySelectorAll("[data-flow-step]");
  var flowPanels = document.querySelectorAll("[data-flow-panel]");
  if (flowSteps.length && flowPanels.length) {
    var flowProgress = document.querySelector("[data-flow-progress]");
    var flowStatus = document.querySelector("[data-flow-status]");
    var flowHeadline = document.querySelector("[data-flow-headline]");
    var flowHeadlines = [
      "Nenhuma alteração começa sem contexto.",
      "Você escolhe depois de entender o impacto.",
      "A execução deixa um rastro que você consegue revisar.",
      "O caminho de volta fica perto da decisão."
    ];
    function activateFlow(index, moveFocus) {
      var next = Math.max(0, Math.min(index, flowSteps.length - 1));
      flowSteps.forEach(function (step, stepIndex) {
        var active = stepIndex === next;
        step.classList.toggle("is-active", active);
        step.setAttribute("aria-selected", active ? "true" : "false");
        step.setAttribute("tabindex", active ? "0" : "-1");
      });
      flowPanels.forEach(function (panel, panelIndex) {
        panel.hidden = panelIndex !== next;
      });
      var activePanel = flowPanels[next];
      var activeLabel = activePanel && activePanel.querySelector(".flow-panel-head > div > span");
      if (flowProgress) flowProgress.style.height = (((next + 1) / flowSteps.length) * 100) + "%";
      if (flowStatus) flowStatus.textContent = "ETAPA 0" + (next + 1) + " / " + (activeLabel ? activeLabel.textContent : "FLUXO");
      if (flowHeadline) flowHeadline.textContent = flowHeadlines[next] || flowHeadlines[0];
      if (moveFocus) flowSteps[next].focus();
    }
    flowSteps.forEach(function (step, index) {
      step.addEventListener("click", function () { activateFlow(index, false); });
      step.addEventListener("keydown", function (event) {
        var next = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next += 1;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") next -= 1;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = flowSteps.length - 1;
        if (next !== index) {
          event.preventDefault();
          activateFlow(next < 0 ? flowSteps.length - 1 : next >= flowSteps.length ? 0 : next, true);
        }
      });
    });
    activateFlow(0, false);
  }

  /* ----------------------------------------------------------
     5. REVEAL ON SCROLL
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

  /* ----------------------------------------------------------
     19. PREMIUM MICROINTERACTIONS
     Cursor spotlight + tilt only when motion and pointer allow.
     ---------------------------------------------------------- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  if (!reduceMotion && finePointer) {
    var ambientScene = document.querySelector(".site-page");
    if (ambientScene) {
      ambientScene.addEventListener("pointermove", function (event) {
        var px = Math.round((event.clientX / window.innerWidth) * 100);
        var py = Math.round((event.clientY / window.innerHeight) * 100);
        ambientScene.style.setProperty("--pointer-x", px + "%");
        ambientScene.style.setProperty("--pointer-y", py + "%");
        ambientScene.style.setProperty("--orb-x", ((px - 50) * 0.18) + "px");
        ambientScene.style.setProperty("--orb-y", ((py - 50) * 0.12) + "px");
      }, { passive: true });
    }
    document.querySelectorAll("[data-spotlight]").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", (event.clientX - rect.left) + "px");
        card.style.setProperty("--my", (event.clientY - rect.top) + "px");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--mx", "50%");
        card.style.setProperty("--my", "50%");
      });
    });

    var tiltCard = document.querySelector("[data-tilt]");
    if (tiltCard) {
      tiltCard.addEventListener("pointermove", function (event) {
        var rect = tiltCard.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        tiltCard.style.transform = "perspective(1200px) rotateY(" + (x * 7) + "deg) rotateX(" + (-y * 6) + "deg)";
      });
      tiltCard.addEventListener("pointerleave", function () { tiltCard.style.transform = ""; });
    }
  }

})();
