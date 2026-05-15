/* ============================================================
   МАТЕМАТИКА 5 КЛАСС · Общая логика узлов
   ============================================================ */

var BLOCK_ID = 'math5_block5';
var NODES = ['node1', 'node2', 'node3', 'node4'];

/* ── Таймауты ──────────────────────────────────────────────── */

var TIMING = {
  wrongHint:  3000,
  quizNext:   3000,
  matchShake:  500
};

/* ── Прогресс ──────────────────────────────────────────────── */

var Progress = {
  _key: function() { return BLOCK_ID + '_progress'; },

  load: function() {
    try { return JSON.parse(localStorage.getItem(this._key())) || {}; }
    catch(e) { return {}; }
  },

  save: function(data) {
    try { localStorage.setItem(this._key(), JSON.stringify(data)); }
    catch(e) {}
  },

  markDone: function(nodeId) {
    var data = this.load();
    data[nodeId] = { done: true, ts: Date.now() };
    this.save(data);
    this.checkBlockDone();
  },

  checkBlockDone: function() {
    var data = this.load();
    var allDone = true;
    var i;
    for (i = 0; i < NODES.length; i++) {
      if (!data[NODES[i]] || !data[NODES[i]].done) { allDone = false; break; }
    }
    if (allDone) { data.blockDone = true; this.save(data); }
  },

  isDone: function(nodeId) {
    var data = this.load();
    return !!(data[nodeId] && data[nodeId].done);
  },

  countDone: function() {
    var data = this.load();
    var count = 0;
    var i;
    for (i = 0; i < NODES.length; i++) {
      if (data[NODES[i]] && data[NODES[i]].done) { count++; }
    }
    return count;
  },

  reset: function() {
    try { localStorage.removeItem(this._key()); } catch(e) {}
  }
};

/* ── Навигация ─────────────────────────────────────────────── */

function goBack() { window.location.href = 'index.html'; }
function goNode(n) { window.location.href = 'node' + n + '.html'; }

/* ── Утилиты ───────────────────────────────────────────────── */

function shuffle(arr) {
  var a = arr.slice(), i, j, t;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function shuffleArr(arr) {
  var a = arr.slice(), i, j, t;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/* ── Хелперы дробей ────────────────────────────────────────── */

function fr(n, d) {
  return '<span class="frac"><span class="frac-n">' + n + '</span><span class="frac-bar"></span><span class="frac-d">' + d + '</span></span>';
}

function fri(n, d) { return ' ' + fr(n, d) + ' '; }

/* ── Опорный конспект ──────────────────────────────────────── */

function toggleCS() {
  var btn  = document.getElementById('csToggle');
  var body = document.getElementById('csBody');
  if (body.className.indexOf('open') >= 0) {
    body.className = 'cs-body card';
    btn.className  = 'cs-toggle';
  } else {
    body.className = 'cs-body card open';
    btn.className  = 'cs-toggle open';
  }
}

/* ── Глоссарий ─────────────────────────────────────────────── */

function initGlossary() {
  var list = document.getElementById('glossList');
  list.innerHTML = '';
  var i;
  for (i = 0; i < GLOSSARY.length; i++) {
    (function(item) {
      var el = document.createElement('div');
      el.className = 'gloss-item';
      el.innerHTML = '<div class="gloss-head"><span class="gloss-term">' + item.term + '</span><span class="gloss-arrow">&#9662;</span></div>'
                   + '<div class="gloss-body">' + item.def + '</div>';
      el.onclick = function() {
        if (el.className.indexOf('open') >= 0) { el.className = 'gloss-item'; }
        else { el.className = 'gloss-item open'; }
      };
      list.appendChild(el);
    })(GLOSSARY[i]);
  }
}

/* ── Misconceptions ────────────────────────────────────────── */

var miscActive = -1;

var MISC_ICON_SVG = '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">'
  + '<circle cx="11" cy="11" r="11" fill="#EF4444"/>'
  + '<line x1="7" y1="7" x2="15" y2="15" stroke="white" stroke-width="2.2" stroke-linecap="round"/>'
  + '<line x1="15" y1="7" x2="7" y2="15" stroke="white" stroke-width="2.2" stroke-linecap="round"/>'
  + '</svg>';

function initMisc() {
  var grid = document.getElementById('miscGrid');
  grid.innerHTML = '';
  var i;
  for (i = 0; i < MISCONCEPTIONS.length; i++) {
    (function(m, idx) {
      var card = document.createElement('div');
      card.className = 'misc-card';
      card.id = 'miscCard' + idx;
      var imgHtml = m.hasImg
        ? '<img src="' + m.imgId + '.png" alt="" style="width:100%;aspect-ratio:' + m.imgRatio + ';object-fit:cover;display:block;">'
        : '<div class="img-placeholder" style="aspect-ratio:' + m.imgRatio + ';border-radius:0;border:none;background:#EDE6D8;">'
          + '<div class="img-placeholder-icon">\uD83D\uDDBC</div>'
          + '<div class="img-placeholder-id">' + m.imgId + ' \xb7 3:2</div>'
          + '<div class="img-placeholder-desc" style="font-size:15px;">' + m.imgDesc + '</div>'
          + '</div>';
      card.innerHTML = imgHtml + '<div class="misc-card-label">' + m.label + '</div>';
      card.onclick = function() { miscTap(idx); };
      grid.appendChild(card);
    })(MISCONCEPTIONS[i], i);
  }
}

function miscTap(idx) {
  var grid  = document.getElementById('miscGrid');
  var panel = document.getElementById('miscPanel');
  var cards = grid.querySelectorAll('.misc-card');
  var m = MISCONCEPTIONS[idx];
  var i;

  if (miscActive === idx) {
    miscActive = -1;
    for (i = 0; i < cards.length; i++) { cards[i].className = 'misc-card'; }
    panel.className = 'misc-panel';
    panel.innerHTML = '';
    return;
  }

  miscActive = idx;
  for (i = 0; i < cards.length; i++) { cards[i].className = 'misc-card'; }
  cards[idx].className = 'misc-card active';

  panel.className = 'misc-panel open';
  panel.innerHTML = '<div class="misc-panel-head">'
    + '<div class="misc-panel-head-icon">' + MISC_ICON_SVG + '</div>'
    + '<div class="misc-wrong">' + m.wrong + '</div></div>'
    + '<div class="misc-body">'
    + '<div class="misc-why">' + m.whyWrong + '</div>'
    + '<div class="misc-correct">' + m.correct + '</div>'
    + '<div class="misc-hint">&#9989; ' + m.hint + '</div>'
    + '</div>';
}

/* ── DYK ───────────────────────────────────────────────────── */

var dykActive = -1;

function initDYK() {
  var grid = document.getElementById('dykGrid');
  grid.innerHTML = '';
  var i;
  for (i = 0; i < DYK.length; i++) {
    (function(d, idx) {
      var card = document.createElement('div');
      card.className = 'dyk-card';
      card.id = 'dykCard' + idx;
      var imgHtml = d.hasImg
        ? '<img src="' + d.imgId + '.png" alt="" style="width:100%;aspect-ratio:3/2;object-fit:cover;display:block;border-radius:0;">'
        : (d.imgId
          ? '<div class="img-placeholder img-ph-3-2" style="border-radius:0;border:none;background:#EDE6D8;">'
            + '<div class="img-placeholder-icon">\uD83D\uDDBC</div>'
            + '<div class="img-placeholder-id">' + d.imgId + ' \xb7 3:2</div>'
            + '<div class="img-placeholder-desc" style="font-size:15px;">' + d.imgDesc + '</div>'
            + '</div>'
          : '');
      card.innerHTML = imgHtml
        + '<div class="dyk-card-body">'
        + '<div class="dyk-tag">' + d.tag + '</div>'
        + '<div class="dyk-title">' + d.title + '</div>'
        + '</div>';
      card.onclick = function() { dykTap(idx); };
      grid.appendChild(card);
    })(DYK[i], i);
  }
}

function dykTap(idx) {
  var grid  = document.getElementById('dykGrid');
  var panel = document.getElementById('dykPanel');
  var cards = grid.querySelectorAll('.dyk-card');
  var d = DYK[idx];
  var i;

  if (dykActive === idx) {
    dykActive = -1;
    for (i = 0; i < cards.length; i++) { cards[i].className = 'dyk-card'; }
    panel.className = 'dyk-panel';
    panel.innerHTML = '';
    return;
  }

  dykActive = idx;
  for (i = 0; i < cards.length; i++) { cards[i].className = 'dyk-card'; }
  cards[idx].className = 'dyk-card active';

  panel.className = 'dyk-panel open';
  panel.innerHTML = '<div class="dyk-panel-head">'
    + '<div class="dyk-panel-tag">' + d.tag + '</div>'
    + '<div class="dyk-panel-title">' + d.title + '</div>'
    + '</div>'
    + '<div class="dyk-panel-body">'
    + '<p class="dyk-panel-teaser">' + d.teaser + '</p>'
    + d.text
    + '</div>';
}

/* ── Запомни ───────────────────────────────────────────────── */

function initRemember() {
  var list = document.getElementById('rememberList');
  list.innerHTML = '';
  var i;
  for (i = 0; i < REMEMBER.length; i++) {
    var item = document.createElement('div');
    item.className = 'remember-item';
    item.innerHTML = '<div class="remember-dot"></div><div class="remember-text">' + REMEMBER[i] + '</div>';
    list.appendChild(item);
  }
}

/* ── Проверь себя ──────────────────────────────────────────── */

function initSelfcheck() {
  var list = document.getElementById('selfcheckList');
  list.innerHTML = '';
  var i;
  for (i = 0; i < SELFCHECK.length; i++) {
    var item = document.createElement('div');
    item.className = 'selfcheck-item';
    item.innerHTML = '<span class="selfcheck-num">' + (i + 1) + '.</span>' + SELFCHECK[i];
    list.appendChild(item);
  }
}

/* ── Финальный квиз ────────────────────────────────────────── */

var qIdx     = 0;
var qScore   = 0;
var qResults = [];
var qAnswered = false;

function initQuiz() {
  qIdx      = 0;
  qScore    = 0;
  qResults  = [];
  renderQuizProg();
  renderQuizQ();
}

function renderQuizProg() {
  var prog = document.getElementById('qProg');
  prog.innerHTML = '';
  var i;
  for (i = 0; i < QUIZ_QS.length; i++) {
    var dot = document.createElement('div');
    if (i < qIdx) {
      dot.className = 'quiz-dot ' + (qResults[i] ? 'correct' : 'wrong');
    } else if (i === qIdx) {
      dot.className = 'quiz-dot current';
    } else {
      dot.className = 'quiz-dot';
    }
    prog.appendChild(dot);
  }
}

function renderQuizQ() {
  if (qIdx >= QUIZ_QS.length) { showFinish(); return; }
  qAnswered = false;
  var q    = QUIZ_QS[qIdx];
  var card = document.getElementById('qCard');
  var shuffled = shuffleArr(q.opts.map(function(o, i) {
    return { text: o, correct: i === q.c };
  }));
  var optsHtml = '';
  var i;
  for (i = 0; i < shuffled.length; i++) {
    optsHtml += '<button class="quiz-opt" data-correct="' + (shuffled[i].correct ? 'true' : 'false') + '" onclick="quizTap(this,' + qIdx + ')">' + shuffled[i].text + '</button>';
  }
  card.innerHTML = '<div class="quiz-qw">'
    + '<div class="quiz-cnt">Вопрос ' + (qIdx + 1) + ' из ' + QUIZ_QS.length + '</div>'
    + '<div class="quiz-qt">' + q.q + '</div>'
    + '</div>'
    + '<div class="quiz-opts">' + optsHtml + '</div>'
    + '<div class="quiz-explain" id="qExpl"></div>'
    + '<button class="quiz-next" id="qNext" onclick="quizNext()"></button>';
}

function quizTap(btn, qi) {
  if (qAnswered) return;
  qAnswered = true;
  var correct = btn.getAttribute('data-correct') === 'true';
  var card = document.getElementById('qCard');
  var btns = card.querySelectorAll('.quiz-opt');
  var k;
  for (k = 0; k < btns.length; k++) { btns[k].style.pointerEvents = 'none'; }
  if (correct) {
    btn.classList.add('correct');
    qScore++;
  } else {
    btn.classList.add('wrong');
    for (k = 0; k < btns.length; k++) {
      if (btns[k].getAttribute('data-correct') === 'true') { btns[k].classList.add('correct'); }
    }
  }
  qResults[qi] = correct;
  var dot = document.getElementById('qProg').children[qi];
  if (dot) { dot.className = 'quiz-dot ' + (correct ? 'correct' : 'wrong'); }
  var expl = document.getElementById('qExpl');
  expl.className = 'quiz-explain show ' + (correct ? 'ok' : 'err');
  expl.innerHTML = QUIZ_QS[qi].explain;
  var nextBtn = document.getElementById('qNext');
  if (nextBtn) {
    nextBtn.style.display = 'block';
    nextBtn.textContent = (qi + 1 < QUIZ_QS.length) ? 'Следующий вопрос \u2192' : 'Завершить \u2192';
  }
}

function quizNext() {
  qIdx++;
  renderQuizProg();
  renderQuizQ();
}

/* ── Экран завершения ──────────────────────────────────────── */

function showFinish() {
  document.getElementById('finScore').innerHTML = qScore + ' из ' + QUIZ_QS.length;
  var ov = document.getElementById('finOv');
  ov.className = 'finish-ov show';
  if (typeof checkAllDone === 'function') { checkAllDone(); }
}

function finStay() {
  document.getElementById('finOv').className = 'finish-ov';
}
