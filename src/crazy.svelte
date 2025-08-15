<script lang="ts">
  import { createHttpClient } from "./crazy";

  const http = createHttpClient({ defaultTimeoutMs: 5000 });

  type Data = {
    items: any[];
  };

  let searchQuery = $state("");
  let results = $state<Data[]>([]);
  let loading = $state(false);
  let error = $state<Error | null>(null);

  // Hold reference to the active cancelable for last-one-wins
  let activeReq: ReturnType<typeof http.request> | null = null;

  $effect(() => {
    if (!searchQuery) {
      results = [];
      return;
    }

    loading = true;
    error = null;

    // Cancel any previous request
    activeReq?.cancel();

    activeReq = http.request<Data>(
      `/api/search?q=${encodeURIComponent(searchQuery)}`,
      {},
      {
        key: "search",
        lastOneWins: true
      }
    );

    activeReq.promise
      .then((data) => {
        results = data.items;
      })
      .catch((err) => {
        if (err.name !== "AbortError") error = err;
      })
      .finally(() => {
        loading = false;
      });
  });
</script>

<input bind:value={searchQuery} placeholder="Type to search..." />
{#if loading}
  <p>Loading…</p>
{/if}
{#if error}
  <p class="error">{error.message}</p>
{/if}
<ul>
  {#each results as item}
    <li>{item.name}</li>
  {/each}
</ul>
