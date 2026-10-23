import { useCallback, useEffect, useRef, useState } from 'react';
import { STAGES, STAGE_DURATION } from '../lib/pipeline';

let uid = 0;
const makeLine = (stage, l, ts) => ({ id: ++uid, stage, lvl: l.lvl, text: l.text, ts });

// Start with the first `upTo` stages already finished, as if the build is mid-flight.
function seed(script, upTo, run = 0) {
  const now = Date.now();
  const done = STAGES.slice(0, upTo);
  const total = done.reduce((n, s) => n + script[s.id].length, 0);
  let k = 0;
  const lines = done.flatMap((s) => script[s.id].map((l) => makeLine(s.id, l, now - (total - k++) * 700)));
  return {
    run,
    lines,
    current: upTo,
    cursor: 0,
    done: false,
    stages: STAGES.map((s, i) => ({
      status: i < upTo ? 'done' : i === upTo ? 'running' : 'pending',
      duration: i < upTo ? STAGE_DURATION[s.id] : null,
    })),
  };
}

/** Simulates a CI pipeline run, streaming scripted log lines stage by stage. */
export function usePipeline(initialScript, seedStages = 2) {
  const scriptRef = useRef(null);
  if (!scriptRef.current) scriptRef.current = initialScript();
  const [state, setState] = useState(() => seed(scriptRef.current, seedStages));

  useEffect(() => {
    if (state.done) return undefined;
    const stage = STAGES[state.current];
    const finishing = state.cursor >= scriptRef.current[stage.id].length;
    const delay = finishing ? 900 : 220 + Math.random() * 420;
    const t = setTimeout(() => {
      setState((s) => {
        if (s.done || s.run !== state.run) return s;
        const src = scriptRef.current[STAGES[s.current].id];
        if (s.cursor < src.length) {
          return { ...s, lines: [...s.lines, makeLine(STAGES[s.current].id, src[s.cursor], Date.now())], cursor: s.cursor + 1 };
        }
        const stages = s.stages.map((st, i) => (i === s.current ? { status: 'done', duration: STAGE_DURATION[STAGES[i].id] } : st));
        if (s.current === STAGES.length - 1) return { ...s, stages, done: true };
        stages[s.current + 1] = { status: 'running', duration: null };
        return { ...s, stages, current: s.current + 1, cursor: 0 };
      });
    }, delay);
    return () => clearTimeout(t);
  }, [state.run, state.current, state.cursor, state.done]);

  const restart = useCallback((script) => {
    scriptRef.current = script;
    setState((s) => seed(script, 0, s.run + 1));
  }, []);

  const stage = STAGES[state.current];
  const len = scriptRef.current[stage.id].length;
  const fraction = state.done ? 1 : state.cursor / len;

  // Elapsed seconds so far across all stages (running stage is interpolated).
  const elapsed = state.stages.reduce(
    (n, st, i) => n + (st.status === 'done' ? st.duration : st.status === 'running' ? STAGE_DURATION[STAGES[i].id] * fraction : 0),
    0,
  );

  return { ...state, fraction, elapsed, restart };
}
