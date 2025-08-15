<script lang="ts">
  export const __myButtonMarker = true;

  type Props = {
    label: string;
    variant: "primary" | "secondary";
    onclick: () => void;
  };

  let { label, variant = "primary", onclick }: Props = $props();
</script>

<button class="my-button {variant}" data-my-button {onclick}>
  {label}
</button>

<style>
  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .primary {
    background-color: #3b82f6;
    color: white;
  }

  .secondary {
    background-color: #e5e7eb;
    color: #374151;
  }
</style>
