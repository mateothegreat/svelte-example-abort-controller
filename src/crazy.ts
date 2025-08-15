/* eslint-disable @typescript-eslint/no-explicit-any */

type QueueStrategy = "fifo" | "lifo" | "drop";

export type RetryPolicy = {
  attempts: number; // total attempts including the first (e.g., 3)
  backoffBaseMs?: number; // base delay for backoff (e.g., 150)
  backoffFactor?: number; // multiplier (e.g., 2)
  jitterRatio?: number; // 0..1 fraction of jitter (e.g., 0.2)
  retryOn?: (res: Response | undefined, err: unknown) => boolean;
};

export type Hooks = {
  onEnqueue?: (key?: string) => void;
  onStart?: (info: { key?: string; url: string }) => void;
  onFinish?: (info: {
    key?: string;
    url: string;
    ok: boolean;
    status?: number;
    durationMs: number;
  }) => void;
  onDrop?: (key?: string) => void;
  onError?: (err: unknown, key?: string) => void;
};

export type ClientConfig = {
  maxInFlight?: number; // global concurrency cap; 0/undefined => unlimited
  queueStrategy?: QueueStrategy; // behavior when at cap ("fifo" default)
  defaultTimeoutMs?: number; // per-request timeout
  retry?: RetryPolicy; // default retry policy
  parser?: (res: Response) => Promise<any>; // default parser, JSON by default
  hooks?: Hooks;
};

export type RequestOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
  key?: string; // per-key coordination (e.g., "search?q=foo")
  lastOneWins?: boolean; // abort any previous in-flight with same key
  dedupe?: boolean; // return same parsed result if identical key in-flight
  retry?: RetryPolicy; // override default retry policy
  parser?: (res: Response) => Promise<any>; // override parser per call
};

export type Cancelable<T> = {
  promise: Promise<T>;
  cancel: () => void;
};

export type Task<T> = {
  run: () => void;
  reject: (err: unknown) => void;
  key?: string;
};

export const defaultParser = (res: Response): Promise<any> => {
  const ctype = res.headers.get("content-type") || "";
  if (ctype.includes("application/json")) return res.json();
  if (ctype.startsWith("text/")) return res.text();
  return res.blob();
};

export const sleep = (ms: number) => {
  return new Promise((r) => setTimeout(r, ms));
};

export const calcBackoffDelay = (attemptIndex: number, p: RetryPolicy): number => {
  const base = p.backoffBaseMs ?? 150;
  const factor = p.backoffFactor ?? 2;
  const jitter = p.jitterRatio ?? 0.2;
  const raw = base * Math.pow(factor, Math.max(0, attemptIndex));
  const jitterAmt = raw * jitter * (Math.random() * 2 - 1); // +/- jitter
  return Math.max(0, Math.round(raw + jitterAmt));
};

export const combineSignals = (signals: (AbortSignal | undefined)[]): AbortController => {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  for (const s of signals) {
    if (!s) continue;
    if (s.aborted) {
      controller.abort();
      break;
    }
    s.addEventListener("abort", onAbort, { once: true });
  }
  return controller;
};

export const createHttpClient = (
  config: ClientConfig = {}
): {
  request: <T = any>(
    input: RequestInfo | URL,
    init: RequestInit,
    options: RequestOptions
  ) => Cancelable<T>;
} => {
  const maxInFlight = Math.max(0, config.maxInFlight ?? 0);
  const strategy: QueueStrategy = config.queueStrategy ?? "fifo";
  const parse = config.parser ?? defaultParser;
  const hooks = config.hooks ?? {};

  // Global in-flight counter and queue
  let inFlight = 0;
  const queue: Task<any>[] = [];

  // Per-key tracking for lastOneWins and dedupe
  const inFlightByKey = new Map<
    string,
    {
      controller: AbortController;
      // The resolved parsed data promise for dedupe returners
      resultPromise: Promise<any>;
      // For visibility/cleanup
      startedAt: number;
    }
  >();

  function dequeue() {
    if (maxInFlight && inFlight >= maxInFlight) return;
    const task = strategy === "lifo" ? queue.pop() : queue.shift();
    if (!task) return;
    task.run();
  }

  function enqueue<T>(task: Task<T>) {
    if (!maxInFlight || inFlight < maxInFlight) {
      task.run();
    } else {
      if (strategy === "drop") {
        hooks.onDrop?.(task.key);
        task.reject(new Error("Request dropped due to maxInFlight limit"));
        return;
      }
      hooks.onEnqueue?.(task.key);
      if (strategy === "lifo") queue.push(task);
      else queue.push(task);
    }
  }

  async function runWithRetry<T>(doOnce: () => Promise<T>, policy?: RetryPolicy): Promise<T> {
    const p = policy ?? config.retry;
    const shouldRetry =
      p?.retryOn ??
      ((res: Response | undefined, err: unknown) => {
        if (err) return true; // network/abort/etc.
        if (!res) return true;
        return [502, 503, 504].includes(res.status);
      });

    let errLast: unknown;
    for (let i = 0; i < (p?.attempts ?? 1); i++) {
      try {
        return await doOnce();
      } catch (err) {
        errLast = err;
        const isAbort = (err as any)?.name === "AbortError";
        if (isAbort) throw err; // don't retry aborts
        const willRetry = i < p!.attempts - 1 && shouldRetry(undefined, err);
        if (!willRetry) throw err;
        await sleep(calcBackoffDelay(i, p!));
      }
    }
    throw errLast;
  }

  async function doFetch<T>(
    input: RequestInfo | URL,
    init: RequestInit,
    opts: RequestOptions,
    outerController: AbortController
  ): Promise<T> {
    const start = performance.now();
    const url = typeof input === "string" ? input : input.toString();

    hooks.onStart?.({ key: opts.key, url });

    const res = await fetch(input, { ...init, signal: outerController.signal });

    const durationMs = performance.now() - start;
    hooks.onFinish?.({ key: opts.key, url, ok: res.ok, status: res.status, durationMs });

    if (!res.ok) {
      // Still allow caller to parse if they want. Default: throw.
      const err = new Error(`HTTP ${res.status} ${res.statusText}`);
      (err as any).response = res;
      throw err;
    }

    const chosenParser = opts.parser ?? parse;
    return chosenParser(res) as Promise<T>;
  }

  function request<T = any>(
    input: RequestInfo | URL,
    init: RequestInit = {},
    options: RequestOptions = {}
  ): Cancelable<T> {
    const key = options.key;
    let rejectOuter: (err: unknown) => void;
    let resolveOuter: (val: T) => void;

    const promise = new Promise<T>((resolve, reject) => {
      resolveOuter = resolve;
      rejectOuter = reject;
    });

    // Each logical request gets its own controller (composed with timeout and external signal)
    const timeoutMs = options.timeoutMs ?? config.defaultTimeoutMs;
    const timeoutController = new AbortController();

    let timeoutId: any = null;

    if (typeof timeoutMs === "number" && timeoutMs > 0) {
      timeoutId = setTimeout(
        () => timeoutController.abort(new DOMException("Timeout", "AbortError")),
        timeoutMs
      );
    }

    const outerController = combineSignals([options.signal, timeoutController.signal]);

    const task: Task<T> = {
      key,
      reject: rejectOuter,
      run: () => {
        inFlight++;

        // Per-key coordination
        // lastOneWins: abort any previous same-key request
        if (key && options.lastOneWins) {
          const prev = inFlightByKey.get(key);
          if (prev) {
            prev.controller.abort(new DOMException("Replaced by newer request", "AbortError"));
            inFlightByKey.delete(key);
          }
        }

        // dedupe: if an identical keyed request is in-flight, return its parsed result
        if (key && options.dedupe) {
          const active = inFlightByKey.get(key);
          if (active) {
            active.resultPromise
              .then((val) => resolveOuter(val as T))
              .catch((err) => rejectOuter(err))
              .finally(() => {
                // this logical request didn't occupy an inFlight slot; still adjust queue
                inFlight--;
                dequeue();
              });
            return;
          }
        }

        // Track this request under key for L1W/dedupe
        const keyController = key ? new AbortController() : null;
        if (keyController) {
          // If outer aborts -> abort keyed controller
          outerController.signal.addEventListener(
            "abort",
            () => keyController.abort(outerController.signal.reason),
            { once: true }
          );
        }

        // Compose a final controller used for fetch
        const effectiveController = keyController
          ? combineSignals([outerController.signal, keyController.signal])
          : outerController;

        const attempt = () => doFetch<T>(input, init, options, effectiveController);

        runWithRetry<T>(attempt, options.retry ?? config.retry)
          .then((val) => resolveOuter(val))
          .catch((err) => {
            hooks.onError?.(err, key);
            rejectOuter(err);
          })
          .finally(() => {
            inFlight--;
            if (timeoutId) clearTimeout(timeoutId);
            if (key) inFlightByKey.delete(key);
            dequeue();
          });

        if (key) {
          // Keep a dedupe record of the parsed result promise
          const resultPromise = promise;
          inFlightByKey.set(key, {
            controller: effectiveController,
            resultPromise,
            startedAt: performance.now()
          });
        }
      }
    };

    enqueue(task);

    return {
      promise,
      cancel: () => {
        timeoutController.abort(new DOMException("Cancelled", "AbortError"));
      }
    };
  }

  return {
    request
  };
};
