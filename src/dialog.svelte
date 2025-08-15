<script lang="ts">
  import type { Snippet } from "svelte";
  import { onMount } from "svelte";

  interface Props {
    acceptButton: Snippet;
    children: Snippet;
    open?: boolean;
    title?: string;
  }

  let {
    acceptButton,
    children,
    open = $bindable(false),
    title = "Dialog",
  }: Props = $props();

  let dialogEl: HTMLDialogElement;
  let snippetContainer: HTMLElement;

  const validateSnippetContent = (): boolean => {
    if (!snippetContainer) return true;

    const buttons = snippetContainer.querySelectorAll("button");
    const invalidElements: string[] = [];

    // Check for invalid HTML buttons (buttons without data-my-button attribute).
    buttons.forEach((btn) => {
      if (!btn.hasAttribute("data-my-button")) {
        invalidElements.push("HTML button elements");
      }
    });

    // Check for third-party button components by class name.
    const allElements = snippetContainer.querySelectorAll("*");
    allElements.forEach((el) => {
      const className = el.className;
      if (
        className &&
        (className.includes("bits") || className.includes("ui-button"))
      ) {
        invalidElements.push("Third-party button components");
      }
    });

    if (invalidElements.length > 0) {
      console.error(
        "Invalid button components detected in dialog:",
        invalidElements
      );
      throw new Error(
        `Only My-Button components are allowed in dialog snippets. Found: ${invalidElements.join(", ")}`
      );
    }

    return true;
  };

  // Validate snippet content after mount.
  onMount(() => {
    if (open && dialogEl) {
      dialogEl.showModal();
    }
    setTimeout(() => validateSnippetContent(), 0);
  });

  $effect(() => {
    if (dialogEl) {
      if (open) {
        dialogEl.showModal();
        // Re-validate when dialog opens.
        setTimeout(() => validateSnippetContent(), 0);
      } else {
        dialogEl.close();
      }
    }
  });

  function handleClose() {
    open = false;
  }
</script>

<dialog bind:this={dialogEl} onclose={handleClose}>
  <div class="dialog-content">
    <header class="dialog-header">
      <h2>{title}</h2>
      <button class="close-btn" onclick={handleClose}>×</button>
    </header>

    <div class="dialog-body">
      {@render children()}
    </div>

    <footer class="dialog-footer">
      <div bind:this={snippetContainer} data-button-container>
        {@render acceptButton()}
      </div>
    </footer>
  </div>
</dialog>

<style>
  dialog {
    border: none;
    border-radius: 8px;
    padding: 0;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 90vw;
  }

  dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    min-height: 200px;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
  }

  .dialog-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    color: #374151;
  }

  .dialog-body {
    flex: 1;
    padding: 20px;
  }

  .dialog-footer {
    padding: 20px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
