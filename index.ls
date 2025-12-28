start = null
is-blink = false
is-light = true
is-run = false
is-show = true
is-warned = false
handler = null
latency = 0
stop-by = null
delay = 1500 * 1000
audio-remind = null
audio-end = null
paused-total = 0
session-duration = delay
completion-handled = false

new-audio = (file) ->
  node = new Audio!
    ..src = file
    ..loop = false
    ..load!
  document.body.appendChild node
  return node

sound-toggle = (des, state) ->
  if state => des.play!
  else des
    ..currentTime = 0
    ..pause!

format-duration = (ms) ->
  total = Math.max(Math.round(ms / 1000), 0)
  hours = Math.floor(total / 3600)
  minutes = Math.floor((total % 3600) / 60)
  seconds = total % 60
  pad = (v) -> if v < 10 => "0#{v}" else "#{v}"
  if hours > 0 => "#{hours}:#{pad(minutes)}:#{pad(seconds)}"
  else "#{minutes}:#{pad(seconds)}"

update-timer-display = (ms) ->
  $ \#timer .text format-duration ms
  resize!

update-paused-display = ->
  $ \#paused-time .text format-duration paused-total

show = ->
  is-show := !is-show
  $ \.fbtn .css \opacity, if is-show => \1.0 else \0.1

adjust = (it,v) ->
  if is-blink => return
  delay := delay + it * 1000
  if it==0 => delay := v * 1000
  if delay <= 0 => delay := 0
  update-timer-display delay

toggle = ->
  is-run := !is-run
  $ \#toggle .text if is-run => "STOP" else "RUN"
  if !is-run and handler =>
    stop-by := new Date!
    clearInterval handler
    handler := null
    sound-toggle audio-end, false
    sound-toggle audio-remind, false
  if is-run and stop-by =>
    pause-duration = (new Date!)getTime! - stop-by.getTime!
    latency := latency + pause-duration
    paused-total := paused-total + pause-duration
    stop-by := null
    update-paused-display!
  if is-run => run!

reset = ->
  if delay == 0 => delay := 1000
  sound-toggle audio-remind, false
  sound-toggle audio-end, false
  stop-by := null
  is-warned := false
  is-blink := false
  latency := 0
  paused-total := 0
  session-duration := delay
  completion-handled := false
  start := null #new Date!
  is-run := true
  toggle!
  if handler => clearInterval handler
  handler := null
  update-paused-display!
  $ \#session-result .text ""
  update-timer-display delay
  $ \#timer .css \color, \#fff


blink = ->
  is-blink := true
  is-light := !is-light
  $ \#timer .css \color, if is-light => \#fff else \#f00

count = ->
  tm = $ \#timer
  diff = start.getTime! - (new Date!)getTime! + delay + latency
  if diff > 60000 => is-warned := false
  if diff < 60000 and !is-warned =>
    is-warned := true
    sound-toggle audio-remind, true
  if diff < 55000 => sound-toggle audio-remind, false
  if diff < 0 and !is-blink =>
    sound-toggle audio-end, true
    is-blink := true
    diff = 0
    clearInterval handler
    handler := setInterval ( -> blink!), 500
    handle-complete!
  update-timer-display diff

handle-complete = ->
  return if completion-handled
  completion-handled := true
  is-run := false
  stop-by := null
  summary = "計時 #{format-duration session-duration)}，暫停 #{format-duration paused-total)}"
  done = window.prompt "完成幾份檢查？", ""
  if done? and done.trim!length > 0 and !isNaN(parseFloat done)
    finished = parseFloat done
    hours = if session-duration > 0 => session-duration / 3600000 else 0
    if hours > 0
      rate = Math.round((finished / hours) * 10) / 10
      summary += "，完成 #{finished} 份，效率約 #{rate} 份/小時"
  $ \#session-result .text summary

run =  ->
  if start == null =>
    start := new Date!
    latency := 0
    is-blink := false
    paused-total := 0
    completion-handled := false
    session-duration := delay
    update-paused-display!
  if handler => clearInterval handler
  if is-blink => handler := setInterval (-> blink!), 500
  else handler := setInterval (-> count!), 100

resize = ->
  tm = $ \#timer
  w = tm.width!
  h = $ window .height!
  len = tm.text!length
  len>?=3
  tm.css \font-size, "#{1.5 * w/len}px"
  tm.css \line-height, "#{h}px"


window.onload = ->
  update-timer-display delay
  update-paused-display!
  $ \#session-result .text ""
  #audio-remind := new-audio \audio/cop-car.mp3
  #audio-end := new-audio \audio/fire-alarm.mp3
  audio-remind := new-audio \audio/smb_warning.mp3
  audio-end := new-audio \audio/smb_mariodie.mp3
window.onresize = -> resize!
