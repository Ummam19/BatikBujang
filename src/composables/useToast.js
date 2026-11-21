import { reactive } from 'vue'

const state = reactive({ items: [] })
let seq = 0

function dismiss(id) {
  const i = state.items.findIndex((t) => t.id === id)
  if (i > -1) state.items.splice(i, 1)
}

function push(type, message, timeout = 3800) {
  const id = ++seq
  state.items.push({ id, type, message })
  if (timeout) setTimeout(() => dismiss(id), timeout)
  return id
}

export function useToast() {
  return {
    toasts: state.items,
    dismiss,
    success: (m) => push('success', m),
    error: (m) => push('error', m, 6000),
    warning: (m) => push('warning', m, 5000),
    info: (m) => push('info', m)
  }
}
