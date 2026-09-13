function create(initializer) {
  let state;
  const listeners = new Set();
  const set = (partial) => {
    const patch = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...patch };
    for (const listener of listeners) listener(state);
  };
  const get = () => state;
  state = initializer(set, get, {});
  function hook(selector = (value) => value) { return selector(state); }
  hook.getState = get;
  hook.setState = set;
  hook.subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
  return hook;
}
module.exports = { create };
