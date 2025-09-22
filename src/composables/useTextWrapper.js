import { computed, ref, onMounted, onUnmounted } from "vue";

/**
 * Composable for wrapping text with line numbers and comment formatting
 * @param {Object} options - Configuration options
 * @param {string} options.text - The text to wrap
 * @param {string} options.fontFamily - Font family for character width calculation
 * @param {number} options.fontSize - Font size for character width calculation
 * @param {string} options.commentStyle - Style of comment formatting ('js', 'css', 'none')
 * @param {number} options.lineNumberWidth - Width reserved for line numbers
 * @param {number} options.padding - Additional padding to account for
 */
export function useTextWrapper(options = {}) {
  const {
    text = "",
    fontFamily = "Fira Code",
    fontSize = 14,
    commentStyle = "js", // 'js', 'css', 'none'
    lineNumberWidth = 50,
    padding = 50
  } = options;

  // Template refs
  const containerRef = ref(null);
  const contentRef = ref(null);

  // Reactive state for container width
  const containerWidth = ref(0);

  // Comment formatting based on style
  const getCommentFormat = (style) => {
    switch (style) {
      case "js":
        return { start: "/**", end: "*/", prefix: "* " };
      case "css":
        return { start: "/*", end: "*/", prefix: " * " };
      case "none":
        return { start: "", end: "", prefix: "" };
      default:
        return { start: "/**", end: "*/", prefix: "* " };
    }
  };

  // Function to calculate character width based on font
  const getCharacterWidth = () => {
    // Create a temporary canvas to measure text width
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `${fontSize}px '${fontFamily}', monospace`;
    return context.measureText("M").width; // Use 'M' as it's typically the widest character
  };

  // Function to wrap text based on available width
  const wrapText = (text, maxWidth, charWidth, prefix = "") => {
    const maxCharsPerLine = Math.floor(maxWidth / charWidth) - prefix.length;
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;

      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(`${prefix}${currentLine}`);
          currentLine = word;
        } else {
          // Handle very long words that exceed line width
          lines.push(`${prefix}${word}`);
        }
      }
    }

    if (currentLine) {
      lines.push(`${prefix}${currentLine}`);
    }

    return lines;
  };

  // Computed property to create display lines with dynamic wrapping
  const displayLines = computed(() => {
    if (!containerWidth.value) {
      // Fallback: add prefix to each line
      const lines = text.split("\n");
      const format = getCommentFormat(commentStyle);
      const result = format.start ? [format.start] : [];
      
      for (const line of lines) {
        if (line.trim() === "") {
          result.push(format.prefix || "");
        } else {
          result.push(`${format.prefix}${line}`);
        }
      }
      
      if (format.end) {
        result.push(format.end);
      }
      
      return result;
    }

    const charWidth = getCharacterWidth();
    const contentWidth = containerWidth.value - lineNumberWidth - padding;
    const format = getCommentFormat(commentStyle);
    const allLines = format.start ? [format.start] : [];

    const originalLines = text.split("\n");

    for (const line of originalLines) {
      if (line.trim() === "") {
        // Keep empty lines as just prefix
        allLines.push(format.prefix || "");
      } else {
        // Wrap lines that have content and add prefix
        const wrappedLines = wrapText(line.trim(), contentWidth, charWidth, format.prefix);
        allLines.push(...wrappedLines);
      }
    }

    if (format.end) {
      allLines.push(format.end);
    }
    
    return allLines;
  });

  // Function to update container width
  const updateWidth = () => {
    if (contentRef.value) {
      containerWidth.value = contentRef.value.clientWidth;
    }
  };

  // Resize observer to handle window resize
  let resizeObserver = null;

  onMounted(() => {
    updateWidth();

    // Set up resize observer for responsive behavior
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(updateWidth);
      if (containerRef.value) {
        resizeObserver.observe(containerRef.value);
      }
    }

    // Fallback: listen to window resize
    window.addEventListener("resize", updateWidth);
  });

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    window.removeEventListener("resize", updateWidth);
  });

  return {
    containerRef,
    contentRef,
    displayLines,
    updateWidth
  };
}
