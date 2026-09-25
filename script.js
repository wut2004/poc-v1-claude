/* PTTEP Careers — landing page interactions (vanilla JS) */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Sample positions for the prototype — replace with real data from the careers system.
  var JOBS = [
    { title: "Geophysicist", category: "geoscience", location: "กรุงเทพฯ", type: "Experienced", tags: ["seismic", "interpretation"] },
    { title: "Petroleum Geologist", category: "geoscience", location: "กรุงเทพฯ", type: "Experienced", tags: ["geology", "exploration"] },
    { title: "Reservoir Engineer", category: "engineering", location: "กรุงเทพฯ", type: "Experienced", tags: ["reservoir", "simulation"] },
    { title: "Subsea Pipeline Engineer", category: "engineering", location: "สงขลา", type: "Experienced", tags: ["offshore", "pipeline"] },
    { title: "Offshore Production Supervisor", category: "operations", location: "แท่นผลิตอ่าวไทย", type: "Experienced", tags: ["offshore", "rotation"] },
    { title: "HSE Specialist", category: "operations", location: "สงขลา", type: "Experienced", tags: ["safety", "environment"] },
    { title: "Data Scientist", category: "digital", location: "กรุงเทพฯ", type: "Experienced", tags: ["ai", "python", "analytics"] },
    { title: "Robotics & Automation Engineer", category: "digital", location: "กรุงเทพฯ", type: "Experienced", tags: ["robotics", "iot"] },
    { title: "Investment Analyst", category: "business", location: "กรุงเทพฯ", type: "Experienced", tags: ["finance", "m&a"] },
    { title: "Carbon Capture & Storage Engineer", category: "newenergy", location: "กรุงเทพฯ", type: "Experienced", tags: ["ccs", "net zero"] },
    { title: "Hydrogen Business Development", category: "newenergy", location: "กรุงเทพฯ", type: "Experienced", tags: ["hydrogen", "strategy"] },
    { title: "New Graduate — Engineering", category: "graduate", location: "กรุงเทพฯ / สงขลา", type: "New Graduate", tags: ["engineering", "rotation"] },
    { title: "New Graduate — Geoscience", category: "graduate", location: "กรุงเทพฯ", type: "New Graduate", tags: ["geology", "geophysics"] },
    { title: "Summer Internship — Digital", category: "internship", location: "กรุงเทพฯ", type: "Internship", tags: ["student", "data"] },
    { title: "Summer Internship — Engineering", category: "internship", location: "กรุงเทพฯ / สงขลา", type: "Internship", tags: ["student", "field"] }
  ];

  var CATEGORY_LABEL = {
    geoscience: "ธรณีศาสตร์",
    engineering: "วิศวกรรม",
    operations: "ปฏิบัติการ",
    digital: "ดิจิทัล",
    business: "ธุรกิจ",
    newenergy: "พลังงานใหม่",
    graduate: "ผู้จบใหม่",
    internship: "ฝึกงาน"
  };

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("menuToggle");
  var navLinks = document.getElementById("navLinks");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "ปิดเมนู" : "เปิดเมนู");
    navLinks.classList.toggle("is-open", open);
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var siblings = Array.prototype.filter.call(entry.target.parentNode.children, function (el) {
          return el.classList.contains("reveal");
        });
        var index = Math.max(0, siblings.indexOf(entry.target));
        entry.target.style.transitionDelay = Math.min(index * 70, 350) + "ms";
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Count-up stats ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var start = target - 60;
    var duration = 1400;
    var t0 = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { countUp(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Quote carousel ---------- */
  var slides = document.querySelectorAll(".quote__slide");
  var dotsWrap = document.getElementById("quoteDots");
  var current = 0;
  var timer = null;

  slides.forEach(function (_, i) {
    var dot = document.createElement("button");
    dot.className = "quote__dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "คำพูดที่ " + (i + 1));
    dot.addEventListener("click", function () { go(i); restart(); });
    dotsWrap.appendChild(dot);
  });
  var dots = dotsWrap.querySelectorAll(".quote__dot");

  function go(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach(function (s, idx) { s.classList.toggle("is-active", idx === current); });
    dots.forEach(function (d, idx) { d.setAttribute("aria-selected", String(idx === current)); });
  }
  function restart() {
    clearInterval(timer);
    if (!reduceMotion) timer = setInterval(function () { go(current + 1); }, 6000);
  }
  document.getElementById("quotePrev").addEventListener("click", function () { go(current - 1); restart(); });
  document.getElementById("quoteNext").addEventListener("click", function () { go(current + 1); restart(); });
  go(0);
  restart();

  /* ---------- Job search & filter ---------- */
  var list = document.getElementById("jobList");
  var search = document.getElementById("jobSearch");
  var chips = document.querySelectorAll(".chip");
  var countEl = document.getElementById("resultCount");
  var emptyEl = document.getElementById("emptyState");
  var activeFilter = "all";

  var ICON_PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9.5" r="2.5" fill="currentColor"/></svg>';
  var ICON_BAG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function render() {
    var q = search.value.trim().toLowerCase();
    var results = JOBS.filter(function (job) {
      var matchCat = activeFilter === "all" || job.category === activeFilter;
      var haystack = [job.title, job.location, job.type, CATEGORY_LABEL[job.category]].concat(job.tags).join(" ").toLowerCase();
      return matchCat && (!q || haystack.indexOf(q) !== -1);
    });

    list.innerHTML = results.map(function (job, i) {
      return '<li class="job" style="animation-delay:' + Math.min(i * 40, 400) + 'ms">' +
        '<div>' +
          '<h3 class="job__title">' + escapeHTML(job.title) +
            '<span class="job__tag">' + escapeHTML(CATEGORY_LABEL[job.category]) + '</span></h3>' +
          '<div class="job__meta">' +
            '<span>' + ICON_PIN + escapeHTML(job.location) + '</span>' +
            '<span>' + ICON_BAG + escapeHTML(job.type) + '</span>' +
          '</div>' +
        '</div>' +
        '<a class="btn btn--secondary btn--sm" href="https://www.pttep.com" target="_blank" rel="noopener" aria-label="สมัคร ' + escapeHTML(job.title) + '">สมัคร</a>' +
      '</li>';
    }).join("");

    countEl.textContent = "พบ " + results.length + " ตำแหน่ง";
    emptyEl.hidden = results.length !== 0;
  }

  function setFilter(filter) {
    activeFilter = filter;
    chips.forEach(function (c) {
      var on = c.getAttribute("data-filter") === filter;
      c.classList.toggle("is-selected", on);
      c.setAttribute("aria-pressed", String(on));
    });
    render();
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () { setFilter(chip.getAttribute("data-filter")); });
  });

  var debounce;
  search.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(render, 120);
  });

  // Links from career-path cards / student tiles pre-filter the job list
  document.querySelectorAll("[data-filter-link]").forEach(function (link) {
    link.addEventListener("click", function () { setFilter(link.getAttribute("data-filter-link")); });
  });

  // Search icon in the global nav focuses the search input
  document.querySelectorAll("[data-focus-search]").forEach(function (link) {
    link.addEventListener("click", function () {
      setTimeout(function () { search.focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
    });
  });

  render();

  /* ---------- Sub-nav active link ---------- */
  var subLinks = document.querySelectorAll(".sub-nav__link");
  var sectionIds = ["paths", "students", "jobs"];
  if ("IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        subLinks.forEach(function (l) {
          l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sio.observe(el);
    });
  }

  /* ---------- Floating sticky bar ---------- */
  var bar = document.getElementById("stickyBar");
  var barBtn = bar.querySelector("a");
  var hero = document.querySelector(".hero");
  var jobs = document.getElementById("jobs");
  var footer = document.querySelector(".footer");
  var ticking = false;

  function updateBar() {
    var y = window.scrollY;
    var pastHero = y > hero.offsetTop + hero.offsetHeight - 200;
    var jr = jobs.getBoundingClientRect();
    var inJobs = jr.top < window.innerHeight * 0.6 && jr.bottom > 0;
    var atFooter = footer.getBoundingClientRect().top < window.innerHeight;
    var show = pastHero && !inJobs && !atFooter;
    bar.classList.toggle("is-visible", show);
    bar.setAttribute("aria-hidden", String(!show));
    barBtn.tabIndex = show ? 0 : -1;
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(updateBar); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", updateBar);
  updateBar();

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
