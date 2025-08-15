<script lang="ts">
  /**
   * Cyberpunk AbortController Demo
   * Shows active request status and manual cancellation with neon vibes
   */

  // Simulate a slow request
  const makeRequest = async (query: string, signal: AbortSignal) => {
    const delay = Math.random() * 3000 + 2000; // 2-5 second delay

    log.unshift({
      date: new Date(),
      message: `🚀 INITIALIZING REQUEST: "${query}" [${Math.round(delay)}ms]`,
      type: "info"
    });

    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(resolve, delay);
      signal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        reject(new DOMException("Request aborted", "AbortError"));
      });
    });

    return `NEURAL SCAN COMPLETE: "${query}" | ${Math.floor(Math.random() * 100)} ENTITIES DETECTED`;
  };

  let log = $state<{ date: Date; message: string; type: string }[]>([]);
  let query = $state("");
  let result = $state("");
  let loading = $state(false);
  let error = $state("");
  let controller: AbortController | null = null;

  // Start a new request
  const search = async () => {
    if (!query.trim()) return;

    // Cancel any existing request
    if (controller) {
      controller.abort();
    }

    // Start new request
    controller = new AbortController();
    loading = true;
    error = "";
    result = "";

    try {
      const response = await makeRequest(query, controller.signal);
      result = response;
      log.unshift({
        date: new Date(),
        message: `✅ MISSION COMPLETE: ${response}`,
        type: "success"
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        error = "TRANSMISSION TERMINATED BY ABORT PROTOCOL";
        log.unshift({
          date: new Date(),
          message: `🛑 ABORT SEQUENCE EXECUTED`,
          type: "error"
        });
      } else {
        error = "CRITICAL SYSTEM FAILURE";
        log.unshift({
          date: new Date(),
          message: `💥 NEURAL LINK SEVERED: ${err instanceof Error ? err.message : "Unknown error"}`,
          type: "error"
        });
      }
    } finally {
      loading = false;
      controller = null;
    }
  };

  // Cancel function
  const cancel = () => {
    if (controller) {
      controller.abort();
      log.unshift({
        date: new Date(),
        message: `❌ USER INITIATED ABORT SEQUENCE`,
        type: "warning"
      });
    }
  };
</script>

<div class="relative min-h-screen overflow-hidden bg-black font-mono text-cyan-400">
  <!-- Animated Background Grid Pattern -->
  <div class="fixed inset-0 bg-black opacity-30">
    <div
      class="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20">
    </div>
    <div
      class="absolute inset-0"
      style="background-image: linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px); background-size: 50px 50px; animation: grid-move 20s linear infinite;">
    </div>
  </div>

  <!-- Floating Neon Orbs -->
  <div class="pointer-events-none fixed inset-0">
    <div class="absolute top-1/4 left-1/4 h-2 w-2 animate-ping rounded-full bg-cyan-400 opacity-75">
    </div>
    <div
      class="absolute top-3/4 right-1/4 h-3 w-3 animate-pulse rounded-full bg-pink-500 opacity-50">
    </div>
    <div
      class="absolute bottom-1/4 left-1/3 h-1 w-1 animate-bounce rounded-full bg-green-400 opacity-75">
    </div>
  </div>

  <!-- Main Container -->
  <div class="relative z-10 w-full px-8 py-8">
    <!-- Header -->
    <div class="relative mb-12 text-center">
      <!-- Glitch overlay -->
      <div class="pointer-events-none absolute inset-0">
        <h1
          class="mb-4 translate-x-1 translate-y-0.5 animate-pulse text-6xl font-bold text-cyan-500 opacity-10">
          🤖 ABORT_CTRL.EXE
        </h1>
      </div>

      <h1
        class="relative mb-4 animate-pulse bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 bg-clip-text text-6xl font-bold text-transparent shadow-2xl shadow-cyan-500/25 drop-shadow-2xl">
        🤖 ABORT_CTRL.EXE
      </h1>

      <div class="relative">
        <p
          class="mb-2 border border-cyan-500/30 bg-black/50 px-4 py-2 text-xl tracking-widest text-cyan-300 backdrop-blur-sm">
          [ NEURAL LINK PROTOCOL DEMONSTRATION ]
        </p>
        <div
          class="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent">
        </div>
      </div>

      <div class="mt-4 flex items-center justify-center space-x-4 text-green-400">
        <div class="flex items-center space-x-1">
          <span class="h-3 w-3 animate-ping rounded-full bg-green-400 shadow-lg shadow-green-400/50"
          ></span>
          <span class="text-sm font-bold tracking-wider">SYSTEM ONLINE</span>
          <span class="h-3 w-3 animate-ping rounded-full bg-green-400 shadow-lg shadow-green-400/50"
          ></span>
        </div>
      </div>
    </div>

    <!-- Search Section -->
    <div class="mx-auto mb-12 max-w-2xl">
      <div class="group relative mb-6">
        <!-- Input glow effect -->
        <div
          class="absolute -inset-1 rounded-lg bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500 opacity-25 blur transition duration-300 group-hover:opacity-40">
        </div>

        <input
          bind:value={query}
          placeholder="ENTER NEURAL QUERY..."
          class="relative w-full border-2 border-cyan-500 bg-black p-4 font-mono text-xl tracking-wider text-cyan-400 placeholder-cyan-600 transition-all duration-300 focus:border-pink-500 focus:shadow-lg focus:shadow-cyan-500/50 focus:outline-none"
          on:keydown={(e) => e.key === "Enter" && search()} />

        <!-- Scanning line effect -->
        <div class="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
          <div
            class="absolute top-0 left-0 h-0.5 w-full animate-pulse bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50">
          </div>
          <div
            class="absolute bottom-0 left-0 h-0.5 w-full animate-pulse bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-50">
          </div>
        </div>
      </div>

      <div class="flex justify-center space-x-6">
        <div class="group relative">
          <div
            class="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-green-400 to-cyan-400 opacity-50 blur transition duration-300 group-hover:opacity-75">
          </div>
          <button
            on:click={search}
            disabled={loading || !query.trim()}
            class="relative transform border border-green-400 bg-gradient-to-r from-green-500 to-cyan-500 px-8 py-4 text-lg font-bold tracking-wider text-black uppercase transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/75 disabled:scale-100 disabled:border-gray-600 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500">
            <span class="relative z-10">
              {loading ? "⚡ PROCESSING..." : "🔍 INITIATE SCAN"}
            </span>
          </button>
        </div>

        <div class="group relative">
          <div
            class="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-red-400 to-pink-400 opacity-50 blur transition duration-300 group-hover:opacity-75">
          </div>
          <button
            on:click={cancel}
            disabled={!loading}
            class="relative transform border border-red-400 bg-gradient-to-r from-red-500 to-pink-500 px-8 py-4 text-lg font-bold tracking-wider text-black uppercase transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/75 disabled:scale-100 disabled:border-gray-600 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500">
            <span class="relative z-10"> ❌ ABORT PROTOCOL </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Status Display -->
    <div class="mb-12">
      {#if loading}
        <div
          class="relative animate-pulse overflow-hidden border-2 border-yellow-400 bg-yellow-400/10 p-8 text-center">
          <!-- Scanning line effect -->
          <div
            class="absolute top-0 left-0 h-1 w-full animate-pulse bg-gradient-to-r from-transparent via-yellow-400 to-transparent">
          </div>
          <div
            class="absolute bottom-0 left-0 h-1 w-full animate-pulse bg-gradient-to-r from-transparent via-yellow-400 to-transparent">
          </div>

          <div class="mb-4 text-4xl font-bold tracking-wider text-yellow-300">
            ⚡ NEURAL LINK ACTIVE ⚡
          </div>

          <!-- Enhanced spinner -->
          <div class="relative mb-4 inline-flex items-center justify-center">
            <div
              class="h-16 w-16 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent">
            </div>
            <div
              class="absolute h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-b-transparent"
              style="animation-direction: reverse; animation-duration: 1.5s;">
            </div>
            <div class="absolute h-8 w-8 animate-pulse rounded-full bg-yellow-400"></div>
          </div>

          <p class="mb-2 text-xl font-bold tracking-widest text-yellow-300">
            SCANNING NEURAL PATHWAYS...
          </p>
          <p class="text-lg tracking-wide text-cyan-400">ABORT PROTOCOL IS STANDING BY</p>

          <!-- Enhanced visualizer -->
          <div class="mt-6 flex justify-center space-x-1">
            <div class="h-12 w-3 animate-pulse bg-gradient-to-t from-yellow-400 to-transparent">
            </div>
            <div
              class="h-16 w-3 animate-pulse bg-gradient-to-t from-yellow-400 to-transparent"
              style="animation-delay: 0.1s">
            </div>
            <div
              class="h-10 w-3 animate-pulse bg-gradient-to-t from-cyan-400 to-transparent"
              style="animation-delay: 0.2s">
            </div>
            <div
              class="h-14 w-3 animate-pulse bg-gradient-to-t from-yellow-400 to-transparent"
              style="animation-delay: 0.3s">
            </div>
            <div
              class="h-8 w-3 animate-pulse bg-gradient-to-t from-pink-400 to-transparent"
              style="animation-delay: 0.4s">
            </div>
            <div
              class="h-12 w-3 animate-pulse bg-gradient-to-t from-yellow-400 to-transparent"
              style="animation-delay: 0.5s">
            </div>
            <div
              class="h-18 w-3 animate-pulse bg-gradient-to-t from-cyan-400 to-transparent"
              style="animation-delay: 0.6s">
            </div>
          </div>

          <!-- Background scan effect -->
          <div
            class="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent">
          </div>
        </div>
      {:else if result}
        <div
          class="relative overflow-hidden border-2 border-green-400 bg-green-400/10 p-8 text-center">
          <!-- Success glow -->
          <div
            class="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-r from-green-400/5 via-green-400/10 to-green-400/5">
          </div>
          <div
            class="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-green-400 to-transparent">
          </div>
          <div
            class="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-green-400 to-transparent">
          </div>

          <div class="mb-4 text-4xl font-bold tracking-wider text-green-400">
            ✅ NEURAL SCAN COMPLETE
          </div>
          <div class="relative mb-4 border border-green-400/30 bg-black/50 p-4">
            <p class="font-mono text-xl text-green-300">{result}</p>
          </div>
          <div class="text-lg font-bold tracking-widest text-cyan-400">MISSION STATUS: SUCCESS</div>
        </div>
      {:else if error}
        <div class="relative overflow-hidden border-2 border-red-400 bg-red-400/10 p-8 text-center">
          <!-- Error effects -->
          <div
            class="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-r from-red-400/5 via-red-400/10 to-red-400/5">
          </div>
          <div
            class="absolute top-0 left-0 h-1 w-full animate-pulse bg-gradient-to-r from-transparent via-red-400 to-transparent">
          </div>
          <div
            class="absolute bottom-0 left-0 h-1 w-full animate-pulse bg-gradient-to-r from-transparent via-red-400 to-transparent">
          </div>

          <div class="mb-4 animate-pulse text-4xl font-bold tracking-wider text-red-400">
            🛑 PROTOCOL TERMINATED
          </div>
          <div class="relative mb-4 border border-red-400/30 bg-black/50 p-4">
            <p class="font-mono text-xl text-red-300">{error}</p>
          </div>
          <div class="text-lg font-bold tracking-widest text-cyan-400">
            ABORTCONTROLLER.EXE EXECUTED SUCCESSFULLY
          </div>
        </div>
      {:else}
        <div
          class="relative overflow-hidden border-2 border-cyan-400 bg-cyan-400/10 p-8 text-center">
          <!-- Idle breathing effect -->
          <div
            class="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-r from-cyan-400/5 via-cyan-400/10 to-cyan-400/5">
          </div>
          <div
            class="absolute top-0 left-0 h-1 w-full animate-pulse bg-gradient-to-r from-transparent via-cyan-400 to-transparent">
          </div>
          <div
            class="absolute bottom-0 left-0 h-1 w-full animate-pulse bg-gradient-to-r from-transparent via-cyan-400 to-transparent">
          </div>

          <div class="mb-4 text-4xl font-bold tracking-wider text-cyan-400">💤 SYSTEM IDLE</div>
          <p class="mb-4 text-xl tracking-wide text-cyan-300">AWAITING NEURAL INPUT...</p>
          <div class="text-lg text-gray-400">INITIATE SCAN TO WITNESS ABORT PROTOCOL</div>

          <!-- Idle indicator dots -->
          <div class="mt-4 flex justify-center space-x-2">
            <div class="h-2 w-2 animate-bounce rounded-full bg-cyan-400"></div>
            <div
              class="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
              style="animation-delay: 0.1s">
            </div>
            <div
              class="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
              style="animation-delay: 0.2s">
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Grid Layout for Instructions and Log -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <!-- Instructions Panel -->
      <div class="group relative overflow-hidden border-2 border-purple-500 bg-purple-500/10 p-6">
        <!-- Panel glow effect -->
        <div
          class="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 opacity-50 blur transition duration-300 group-hover:opacity-75">
        </div>
        <div
          class="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-purple-400 to-transparent">
        </div>
        <div
          class="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-purple-400 to-transparent">
        </div>

        <div class="relative z-10">
          <h3 class="mb-6 flex items-center text-2xl font-bold tracking-wider text-purple-400">
            📋 MISSION BRIEFING
            <span
              class="ml-2 h-3 w-3 animate-ping rounded-full bg-purple-400 shadow-lg shadow-purple-400/50"
            ></span>
          </h3>
          <ol class="space-y-4 text-lg text-cyan-300">
            <li
              class="flex items-start rounded border border-purple-500/30 bg-black/30 p-2 transition-colors hover:bg-purple-900/20">
              <span class="mr-3 text-xl font-bold text-purple-400">01.</span>
              <span class="tracking-wide">Input neural query and execute SCAN protocol</span>
            </li>
            <li
              class="flex items-start rounded border border-purple-500/30 bg-black/30 p-2 transition-colors hover:bg-purple-900/20">
              <span class="mr-3 text-xl font-bold text-purple-400">02.</span>
              <span class="tracking-wide">During active transmission, trigger ABORT sequence</span>
            </li>
            <li
              class="flex items-start rounded border border-purple-500/30 bg-black/30 p-2 transition-colors hover:bg-purple-900/20">
              <span class="mr-3 text-xl font-bold text-purple-400">03.</span>
              <span class="tracking-wide">Observe immediate protocol termination</span>
            </li>
            <li
              class="flex items-start rounded border border-purple-500/30 bg-black/30 p-2 transition-colors hover:bg-purple-900/20">
              <span class="mr-3 text-xl font-bold text-purple-400">04.</span>
              <span class="tracking-wide">Monitor system logs for detailed analysis</span>
            </li>
          </ol>

          <div class="relative mt-6 overflow-hidden border-2 border-purple-400/50 bg-black/50 p-4">
            <div
              class="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-purple-400/5 to-transparent">
            </div>
            <p class="relative z-10 text-purple-300">
              <strong class="text-purple-400">TEMPORAL PARAMETERS:</strong> Each neural scan requires
              2-5 seconds for completion, providing sufficient window for abort protocol testing.
            </p>
          </div>
        </div>
      </div>

      <!-- Log Panel -->
      <div class="group relative overflow-hidden border-2 border-green-400 bg-green-400/10 p-6">
        <!-- Panel glow effect -->
        <div
          class="absolute -inset-1 bg-gradient-to-r from-green-500/20 via-cyan-500/20 to-green-500/20 opacity-50 blur transition duration-300 group-hover:opacity-75">
        </div>
        <div
          class="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-green-400 to-transparent">
        </div>
        <div
          class="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-green-400 to-transparent">
        </div>

        <div class="relative z-10">
          <h3 class="mb-6 flex items-center text-2xl font-bold tracking-wider text-green-400">
            📊 SYSTEM LOG
            <span
              class="ml-2 h-3 w-3 animate-pulse rounded-full bg-green-400 shadow-lg shadow-green-400/50"
            ></span>
          </h3>

          <div class="relative max-h-80 overflow-y-auto border-2 border-green-400/50 bg-black p-4">
            <!-- Terminal scanlines -->
            <div
              class="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-b from-transparent via-green-400/5 to-transparent">
            </div>

            {#if log.length === 0}
              <div class="text-center font-mono text-gray-500 italic">
                [ AWAITING SYSTEM ACTIVITY ]
                <div class="mt-2 flex justify-center space-x-1">
                  <div class="h-1 w-1 animate-ping rounded-full bg-green-400"></div>
                  <div
                    class="h-1 w-1 animate-ping rounded-full bg-green-400"
                    style="animation-delay: 0.2s">
                  </div>
                  <div
                    class="h-1 w-1 animate-ping rounded-full bg-green-400"
                    style="animation-delay: 0.4s">
                  </div>
                </div>
              </div>
            {:else}
              <div class="space-y-1 font-mono">
                {#each log as logItem}
                  <div
                    class="flex items-start space-x-2 border-l-2 border-transparent p-1 text-sm transition-colors hover:border-green-400/50 hover:bg-green-400/5">
                    <span class="text-xs font-bold whitespace-nowrap text-gray-500">
                      {logItem.date.toLocaleTimeString()}
                    </span>
                    <span class="text-green-400">|</span>
                    <span
                      class="flex-1 {logItem.type === 'error'
                        ? 'text-red-400'
                        : logItem.type === 'warning'
                          ? 'text-yellow-400'
                          : 'text-green-300'} tracking-wide">
                      {logItem.message}
                    </span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <div
            class="mt-4 flex justify-between border border-green-400/30 bg-black/50 p-2 text-xs text-gray-500">
            <span class="flex items-center space-x-1">
              <span class="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
              <span>ENTRIES: {log.length}</span>
            </span>
            <span class="flex items-center space-x-1">
              <span>STATUS: MONITORING</span>
              <span class="h-2 w-2 animate-ping rounded-full bg-green-400"></span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="relative mt-12 text-center">
      <div class="relative border-t border-cyan-500/30 pt-8">
        <div
          class="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent">
        </div>

        <div class="mb-4 font-mono text-sm tracking-widest text-gray-500">
          [ POWERED BY ABORTCONTROLLER.EXE v2.0.85 ]
        </div>

        <div class="mb-4 flex justify-center space-x-6 text-sm">
          <div class="flex items-center space-x-2 border border-green-400/30 bg-black/50 px-3 py-1">
            <span
              class="h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-lg shadow-green-400/50"
            ></span>
            <span class="font-bold text-green-400">SYSTEM STABLE</span>
          </div>
          <div class="flex items-center space-x-2 border border-cyan-400/30 bg-black/50 px-3 py-1">
            <span class="h-2 w-2 animate-ping rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
            ></span>
            <span class="font-bold text-cyan-400">NEURAL LINK READY</span>
          </div>
          <div
            class="flex items-center space-x-2 border border-purple-400/30 bg-black/50 px-3 py-1">
            <span
              class="h-2 w-2 animate-pulse rounded-full bg-purple-400 shadow-lg shadow-purple-400/50"
            ></span>
            <span class="font-bold text-purple-400">ABORT PROTOCOLS ARMED</span>
          </div>
        </div>

        <!-- Matrix-style rain effect hint -->
        <div class="font-mono text-xs text-gray-700">&gt; MATRIX.INITIALIZE() ... SUCCESS</div>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes grid-move {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(50px, 50px);
    }
  }

  @keyframes neon-flicker {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
    75% {
      opacity: 0.9;
    }
  }

  @keyframes data-stream {
    0% {
      transform: translateY(-100%);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(100vh);
      opacity: 0;
    }
  }
</style>
