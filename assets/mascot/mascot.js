/**
 * Vanilla port of nilbuild/page-mascot (MIT), plus drag-to-reposition.
 * Two 3x3 sheets: pointer angle picks a direction cell; click flashes a reaction.
 */
(function () {
  const CLOCKWISE = [
    'right',
    'down-right',
    'down',
    'down-left',
    'left',
    'up-left',
    'up',
    'up-right',
  ]
  const REACTIONS = [
    'blink',
    'heart',
    'sparkle',
    'surprised',
    'wink',
    'bashful',
    'sleepy',
    'dizzy',
    'delighted',
  ]
  const SECTOR = (Math.PI * 2) / CLOCKWISE.length
  const HYSTERESIS = 0.12
  const DEAD_ZONE = 70
  const PAYOFFS = ['heart', 'sparkle', 'delighted']
  const BOOP_PAYOFF = 120
  const BOOP_END = 560
  const SQUASH_MS = 420
  const DIZZY_AFTER = 4
  const DIZZY_WINDOW = 1600
  const DIZZY_END = 1100
  const DRAG_THRESHOLD = 6
  const STORAGE_KEY = 'page-mascot-pos'
  const SQUASH = [
    { transform: 'scale(1, 1)', easing: 'ease-in' },
    { transform: 'scale(1.10, 0.86)', offset: 0.18, easing: 'ease-out' },
    { transform: 'scale(0.95, 1.08)', offset: 0.45, easing: 'ease-in-out' },
    { transform: 'scale(1.03, 0.97)', offset: 0.72, easing: 'ease-in-out' },
    { transform: 'scale(1, 1)' },
  ]

  function wrap(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle))
  }

  function cellStyle(index) {
    const x = (index % 3) * 50
    const y = Math.floor(index / 3) * 50
    return x + '% ' + y + '%'
  }

  function setCell(el, index) {
    el.style.backgroundPosition = cellStyle(index)
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n))
  }

  function readPos() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (typeof parsed.left !== 'number' || typeof parsed.top !== 'number') return null
      return parsed
    } catch (e) {
      return null
    }
  }

  function writePos(left, top) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ left: left, top: top }))
    } catch (e) {
      /* private mode / quota — ignore */
    }
  }

  function applyPos(root, left, top) {
    const w = root.offsetWidth || 140
    const h = root.offsetHeight || 140
    const maxL = Math.max(0, window.innerWidth - w)
    const maxT = Math.max(0, window.innerHeight - h)
    const l = clamp(left, 0, maxL)
    const t = clamp(top, 0, maxT)
    root.style.right = 'auto'
    root.style.bottom = 'auto'
    root.style.left = l + 'px'
    root.style.top = t + 'px'
    return { left: l, top: t }
  }

  function restorePos(root) {
    const saved = readPos()
    if (!saved) return
    applyPos(root, saved.left, saved.top)
  }

  function mount(root) {
    if (root.dataset.mascotReady === '1') return
    root.dataset.mascotReady = '1'

    const directionsUrl = root.dataset.directions
    const reactionsUrl = root.dataset.reactions
    if (!directionsUrl || !reactionsUrl) return

    const squash = document.createElement('span')
    squash.className = 'page-mascot__squash'

    const dirs = document.createElement('span')
    dirs.className = 'page-mascot__layer page-mascot__directions'
    dirs.style.backgroundImage = 'url("' + directionsUrl + '")'

    const reacts = document.createElement('span')
    reacts.className = 'page-mascot__layer page-mascot__reactions'
    reacts.style.backgroundImage = 'url("' + reactionsUrl + '")'

    squash.appendChild(dirs)
    squash.appendChild(reacts)
    root.appendChild(squash)
    restorePos(root)

    let direction = 'center'
    let reaction = null
    const timers = []
    const boops = { count: 0, at: 0 }

    function clearTimers() {
      while (timers.length) window.clearTimeout(timers.pop())
    }

    function later(ms, next) {
      timers.push(
        window.setTimeout(function () {
          reaction = next
          render()
        }, ms),
      )
    }

    function render() {
      const dirIndex = Math.max(
        0,
        ['up-left', 'up', 'up-right', 'left', 'center', 'right', 'down-left', 'down', 'down-right'].indexOf(
          direction,
        ),
      )
      const reactIndex = reaction ? Math.max(0, REACTIONS.indexOf(reaction)) : 0
      setCell(dirs, dirIndex)
      setCell(reacts, reactIndex)
      dirs.style.opacity = reaction ? '0' : '1'
      reacts.style.opacity = reaction ? '1' : '0'
    }

    function boop() {
      clearTimers()
      const now = Date.now()
      boops.count = now - boops.at < DIZZY_WINDOW ? boops.count + 1 : 1
      boops.at = now

      if (boops.count >= DIZZY_AFTER) {
        boops.count = 0
        reaction = 'dizzy'
        later(DIZZY_END, null)
      } else {
        reaction = 'blink'
        later(BOOP_PAYOFF, PAYOFFS[(boops.count - 1) % PAYOFFS.length])
        later(BOOP_END, null)
      }
      render()

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      if (typeof squash.animate === 'function') {
        squash.animate(SQUASH, { duration: SQUASH_MS, easing: 'linear' })
      }
    }

    // --- drag ---
    let drag = null
    let suppressClick = false

    function onPointerDown(event) {
      if (event.button != null && event.button !== 0) return
      const box = root.getBoundingClientRect()
      drag = {
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originLeft: box.left,
        originTop: box.top,
        active: false,
      }
      root.setPointerCapture(event.pointerId)
    }

    function onPointerMoveDrag(event) {
      if (!drag || event.pointerId !== drag.id) return
      const dx = event.clientX - drag.startX
      const dy = event.clientY - drag.startY
      if (!drag.active) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
        drag.active = true
        root.classList.add('page-mascot--dragging')
      }
      const next = applyPos(root, drag.originLeft + dx, drag.originTop + dy)
      drag.lastLeft = next.left
      drag.lastTop = next.top
      pointer = { x: event.clientX, y: event.clientY }
      aim()
    }

    function onPointerUp(event) {
      if (!drag || event.pointerId !== drag.id) return
      if (drag.active) {
        suppressClick = true
        const left = drag.lastLeft != null ? drag.lastLeft : drag.originLeft
        const top = drag.lastTop != null ? drag.lastTop : drag.originTop
        const placed = applyPos(root, left, top)
        writePos(placed.left, placed.top)
      }
      try {
        root.releasePointerCapture(event.pointerId)
      } catch (e) {
        /* already released */
      }
      root.classList.remove('page-mascot--dragging')
      drag = null
      window.setTimeout(function () {
        suppressClick = false
      }, 0)
    }

    root.addEventListener('pointerdown', onPointerDown)
    root.addEventListener('pointermove', onPointerMoveDrag)
    root.addEventListener('pointerup', onPointerUp)
    root.addEventListener('pointercancel', onPointerUp)

    root.addEventListener('click', function (event) {
      if (suppressClick) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      boop()
    })

    window.addEventListener(
      'resize',
      function () {
        const box = root.getBoundingClientRect()
        if (box.width && box.height) {
          applyPos(root, box.left, box.top)
        }
      },
      { passive: true },
    )

    let sector = -1
    let pointer = null

    function aim() {
      if (!pointer) return
      const box = root.getBoundingClientRect()
      const dx = pointer.x - (box.left + box.width / 2)
      const dy = pointer.y - (box.top + box.height / 2)

      if (Math.hypot(dx, dy) < DEAD_ZONE) {
        sector = -1
        direction = 'center'
        render()
        return
      }

      const angle = Math.atan2(dy, dx)
      if (sector !== -1 && Math.abs(wrap(angle - sector * SECTOR)) < SECTOR / 2 + HYSTERESIS) {
        return
      }

      sector = (Math.round(angle / SECTOR) + CLOCKWISE.length) % CLOCKWISE.length
      direction = CLOCKWISE[sector]
      render()
    }

    function onPointerMoveAim(event) {
      pointer = { x: event.clientX, y: event.clientY }
      aim()
    }

    window.addEventListener('pointermove', onPointerMoveAim, { passive: true })
    window.addEventListener('scroll', aim, { passive: true })
    render()
  }

  function boot() {
    document.querySelectorAll('[data-page-mascot]').forEach(mount)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
