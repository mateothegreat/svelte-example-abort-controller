<script lang="ts">
  import { onMount } from "svelte";

  const controller = new AbortController();

  const request = async () => {
    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(resolve, 5000);
      controller.signal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        reject(new DOMException("Request aborted", "AbortError"));
      });
    });
  };

  onMount(async () => {
    await request();
    setTimeout(() => {
      controller.abort();
      console.log("request aborted");
    }, 2000);
  });
</script>
