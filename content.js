console.log("YouTube AI Enhancer content script loaded.");

// Move abortPolling flag to global scope so interval and enhancer share it
let abortPolling = false;

function runYouTubeEnhancer() {
  // If already aborted, do not run
  if (abortPolling) {
    console.log("Aborted: not running enhancer due to context invalidation.");
    return;
  }

  const existingSidebar = document.getElementById("yt-transcript-sidebar");

  // If sidebar exists but hidden, show it and return early
  if (existingSidebar) {
    if (existingSidebar.style.display === "none") {
      existingSidebar.style.display = "block";
    }
    return;
  }

  (async () => {
    try {
      // Create sidebar container
      const transcriptDiv = document.createElement("div");
      transcriptDiv.id = "yt-transcript-sidebar";
      transcriptDiv.innerHTML = `
        <div id="yt-transcript-header">
          <strong>Transcript</strong>
          <span>
            <button id="move-transcript-btn">⠿</button>
            <button id="open-settings-btn">⚙️</button>
            <button id="copy-transcript-btn">Copy</button>
            <button id="close-transcript-btn">✖️</button>
          </span>
        </div>
        <div id="yt-transcript-content">Please click the '...more' in the description under the video and click on 'Show transcript' if available.<br/>Loading transcript...</div>
      `;

      document.body.appendChild(transcriptDiv);

      // Create Summarize button
      const summarizeBtn = document.createElement("button");
      summarizeBtn.innerText = "Summarize";
      summarizeBtn.id = "yt-summarize-btn";

      function waitForTargetAndInjectButton() {
        if (abortPolling) return; // abort early
        const target = document.querySelector("#above-the-fold");
        if (target) {
          target.appendChild(summarizeBtn);
        } else {
          console.log("Waiting for YouTube player area...");
          setTimeout(waitForTargetAndInjectButton, 1000);
        }
      }

      waitForTargetAndInjectButton();

      // Load transcript with polling
      async function loadTranscriptWithPolling() {
        const contentDiv = document.querySelector("#yt-transcript-content");
        for (let i = 0; i < 60; i++) {
          if (abortPolling) {
            console.log("Polling aborted due to URL change");
            return "";
          }
          const segments = document.querySelectorAll(
            "yt-formatted-string.segment-text"
          );
          if (segments.length > 0) {
            const transcriptText = [...segments]
              .map((el) => el.innerText)
              .join("\n");
            contentDiv.innerText = transcriptText;
            return transcriptText;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        contentDiv.innerText = "Transcript is not available for this video.";
        return "";
      }

      // Copy transcript to clipboard
      document.getElementById("copy-transcript-btn").onclick = () => {
        if (abortPolling) return;
        const text = document.querySelector("#yt-transcript-content").innerText;
        navigator.clipboard
          .writeText(text)
          .then(() => {
            alert("Transcript copied to clipboard!");
          })
          .catch((e) => {
            console.error("Failed to copy transcript:", e);
          });
      };

      // Open settings/options page
      document.getElementById("open-settings-btn").onclick = () => {
        if (abortPolling) return;
        try {
          chrome.runtime.sendMessage({ action: "openOptions" });
        } catch (e) {
          console.error("Failed to send message to background:", e);
        }
      };

      // Get stored user preferences
      const getPreferences = () =>
        new Promise((resolve) => {
          try {
            chrome.storage.local.get(["platform", "prompt"], resolve);
          } catch (e) {
            console.error("Failed to get preferences:", e);
            resolve({});
          }
        });

      // Handle summarize button click
      summarizeBtn.onclick = async () => {
        if (abortPolling) {
          console.warn("Summarize aborted due to context invalidation.");
          return;
        }

        if (transcriptDiv.style.display === "none") {
          transcriptDiv.style.display = "block";
        }

        let transcript = "";
        try {
          transcript = await loadTranscriptWithPolling();
        } catch (error) {
          if (error.message.includes("Extension context invalidated")) {
            console.warn("Context invalidated, aborting summarize action.");
            return;
          }
          throw error;
        }

        if (abortPolling) return; // Abort if changed while awaiting

        const { platform, prompt } = await getPreferences();

        if (!platform || !prompt) {
          alert(
            "Please set your platform and prompt in the extension options."
          );
          try {
            chrome.runtime.sendMessage({ action: "openOptions" });
          } catch {}
          return;
        }

        const urlMap = {
          ChatGPT: "https://chat.openai.com",
          Gemini: "https://gemini.google.com",
          Claude: "https://claude.ai",
        };

        let summaryPrompt;
        const safeTranscript = transcript.slice(0, 6000);

        if (prompt.includes("[transcript]")) {
          summaryPrompt = prompt.replace("[transcript]", safeTranscript);
        } else {
          summaryPrompt = `${prompt}\n\n---\nTranscript:\n${safeTranscript}`;
        }
        const aiUrl = urlMap[platform];

        if (!aiUrl) {
          alert("Unsupported AI platform selected.");
          return;
        }

        try {
          await navigator.clipboard.writeText(summaryPrompt);
          alert("Summary prompt copied to clipboard. Opening AI tab...");
        } catch (err) {
          alert("Failed to copy prompt. Please try again.");
          return;
        }

        if (abortPolling) return;

        window.open(aiUrl, "_blank");
      };

      // Sidebar close button
      document.getElementById("close-transcript-btn").onclick = () => {
        if (abortPolling) return;
        transcriptDiv.style.display = "none";
      };

      // Drag and drop functionality for sidebar
      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;

      const header = document.getElementById("yt-transcript-header");

      header.style.cursor = "move";
      header.addEventListener("mousedown", (e) => {
        if (abortPolling) return;
        isDragging = true;
        offsetX = e.clientX - transcriptDiv.offsetLeft;
        offsetY = e.clientY - transcriptDiv.offsetTop;
      });

      document.addEventListener("mousemove", (e) => {
        if (abortPolling) return;
        if (isDragging) {
          transcriptDiv.style.left = `${e.clientX - offsetX}px`;
          transcriptDiv.style.top = `${e.clientY - offsetY}px`;
        }
      });

      document.addEventListener("mouseup", () => {
        if (abortPolling) return;
        isDragging = false;
      });

      // Auto-load transcript when sidebar appears, catch errors gracefully
      try {
        if (!abortPolling) await loadTranscriptWithPolling();
      } catch (error) {
        if (error.message.includes("Extension context invalidated")) {
          console.warn("Context invalidated during initial load, aborting.");
          return;
        }
        throw error;
      }
    } catch (error) {
      if (
        error.message &&
        error.message.includes("Extension context invalidated")
      ) {
        console.warn("Context invalidated in enhancer, aborting run.");
        return;
      }
      throw error;
    }
  })();
}

if (location.href.includes("watch?v=")) {
  runYouTubeEnhancer();
}

let lastUrl = location.href;

setInterval(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;

    console.log("URL changed to:", currentUrl);

    // Abort any ongoing polling in the old instance
    abortPolling = true;

    // Remove old sidebar completely if exists
    const oldSidebar = document.getElementById("yt-transcript-sidebar");
    if (oldSidebar) {
      oldSidebar.remove();
    }

    // Remove old Summarize button if exists
    const oldSummarizeBtn = document.getElementById("yt-summarize-btn");
    if (oldSummarizeBtn) {
      oldSummarizeBtn.remove();
    }

    // Reset abortPolling flag for new instance
    abortPolling = false;

    // Only inject if video page
    if (currentUrl.includes("watch?v=")) {
      setTimeout(runYouTubeEnhancer, 1000);
    } else {
      console.log(
        "Not a video page, sidebar and summarize button not injected."
      );
    }
  }
}, 1000);
