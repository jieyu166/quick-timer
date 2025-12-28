// Pomodoro-inspired timer logic
var start, isBlink, isLight, isRun, isShow, isWarned, handler, latency, stopBy, delay, audioRemind, audioEnd, pausedTotal, sessionDuration, completionHandled;
start = null;
isBlink = false;
isLight = true;
isRun = false;
isShow = true;
isWarned = false;
handler = null;
latency = 0;
stopBy = null;
delay = 1500 * 1000;
audioRemind = null;
audioEnd = null;
pausedTotal = 0;
sessionDuration = delay;
completionHandled = false;
var newAudio, soundToggle, formatDuration, updateTimerDisplay, updatePausedDisplay, show, adjust, toggle, reset, blink, handleComplete, count, run, resize;
newAudio = function(file){
  var node;
  node = new Audio();
  node.src = file;
  node.loop = false;
  node.load();
  document.body.appendChild(node);
  return node;
};
soundToggle = function(des, state){
  var x$;
  if (state) {
    return des.play();
  } else {
    x$ = des;
    x$.currentTime = 0;
    x$.pause();
    return x$;
  }
};
formatDuration = function(ms){
  var total, hours, minutes, seconds, pad;
  total = Math.max(Math.round(ms / 1000), 0);
  hours = Math.floor(total / 3600);
  minutes = Math.floor((total % 3600) / 60);
  seconds = total % 60;
  pad = function(v){
    if (v < 10) {
      return "0" + v;
    } else {
      return "" + v;
    }
  };
  if (hours > 0) {
    return hours + ":" + pad(minutes) + ":" + pad(seconds);
  } else {
    return minutes + ":" + pad(seconds);
  }
};
updateTimerDisplay = function(ms){
  $('#timer').text(formatDuration(ms));
  return resize();
};
updatePausedDisplay = function(){
  return $('#paused-time').text(formatDuration(pausedTotal));
};
show = function(){
  isShow = !isShow;
  return $('.fbtn').css('opacity', isShow ? '1.0' : '0.1');
};
adjust = function(it, v){
  if (isBlink) {
    return;
  }
  delay = delay + it * 1000;
  if (it === 0) {
    delay = v * 1000;
  }
  if (delay <= 0) {
    delay = 0;
  }
  return updateTimerDisplay(delay);
};
toggle = function(){
  var pauseDuration;
  isRun = !isRun;
  $('#toggle').text(isRun ? "STOP" : "RUN");
  if (!isRun && handler) {
    stopBy = new Date();
    clearInterval(handler);
    handler = null;
    soundToggle(audioEnd, false);
    soundToggle(audioRemind, false);
  }
  if (isRun && stopBy) {
    pauseDuration = new Date().getTime() - stopBy.getTime();
    latency = latency + pauseDuration;
    pausedTotal = pausedTotal + pauseDuration;
    stopBy = null;
    updatePausedDisplay();
  }
  if (isRun) {
    return run();
  }
};
reset = function(){
  if (delay === 0) {
    delay = 1000;
  }
  soundToggle(audioRemind, false);
  soundToggle(audioEnd, false);
  stopBy = null;
  isWarned = false;
  isBlink = false;
  latency = 0;
  pausedTotal = 0;
  sessionDuration = delay;
  completionHandled = false;
  start = null;
  isRun = true;
  toggle();
  if (handler) {
    clearInterval(handler);
  }
  handler = null;
  updatePausedDisplay();
  $('#session-result').text("");
  updateTimerDisplay(delay);
  $('#timer').css('color', '#fff');
};
blink = function(){
  isBlink = true;
  isLight = !isLight;
  return $('#timer').css('color', isLight ? '#fff' : '#f00');
};
handleComplete = function(){
  var summary, done, finished, hours, rate;
  if (completionHandled) {
    return;
  }
  completionHandled = true;
  isRun = false;
  stopBy = null;
  summary = "計時 " + formatDuration(sessionDuration) + "，暫停 " + formatDuration(pausedTotal);
  done = window.prompt("完成幾份檢查？", "");
  if ((done != null ? done.trim().length : void 0) > 0 && !isNaN(parseFloat(done))) {
    finished = parseFloat(done);
    hours = sessionDuration > 0 ? sessionDuration / 3600000 : 0;
    if (hours > 0) {
      rate = Math.round((finished / hours) * 10) / 10;
      summary += "，完成 " + finished + " 份，效率約 " + rate + " 份/小時";
    }
  }
  return $('#session-result').text(summary);
};
count = function(){
  var tm, diff;
  tm = $('#timer');
  diff = start.getTime() - new Date().getTime() + delay + latency;
  if (diff > 60000) {
    isWarned = false;
  }
  if (diff < 60000 && !isWarned) {
    isWarned = true;
    soundToggle(audioRemind, true);
  }
  if (diff < 55000) {
    soundToggle(audioRemind, false);
  }
  if (diff < 0 && !isBlink) {
    soundToggle(audioEnd, true);
    isBlink = true;
    diff = 0;
    clearInterval(handler);
    handler = setInterval(function(){
      return blink();
    }, 500);
    handleComplete();
  }
  return updateTimerDisplay(diff);
};
run = function(){
  if (start === null) {
    start = new Date();
    latency = 0;
    isBlink = false;
    pausedTotal = 0;
    completionHandled = false;
    sessionDuration = delay;
    updatePausedDisplay();
  }
  if (handler) {
    clearInterval(handler);
  }
  if (isBlink) {
    return handler = setInterval(function(){
      return blink();
    }, 500);
  } else {
    return handler = setInterval(function(){
      return count();
    }, 100);
  }
};
resize = function(){
  var tm, w, h, len, fontSize;
  tm = $('#timer');
  w = tm.width();
  h = $(window).height();
  len = tm.text().length;
  len >= 3 || (len = 3);
  fontSize = 1.5 * w / len;
  fontSize = Math.min(fontSize, h * 0.8);
  return tm.css('font-size', fontSize + "px");
};
window.onload = function(){
  updateTimerDisplay(delay);
  updatePausedDisplay();
  $('#session-result').text("");
  audioRemind = newAudio('audio/smb_warning.mp3');
  return audioEnd = newAudio('audio/smb_mariodie.mp3');
};
window.onresize = function(){
  return resize();
};
