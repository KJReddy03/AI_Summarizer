document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["platform", "prompt"], (data) => {
    document.getElementById("platform").value = data.platform || "ChatGPT";
    document.getElementById("prompt").value =
      data.prompt || "Summarize this YouTube video: [transcript]";
  });

  document.getElementById("save").onclick = () => {
    const platform = document.getElementById("platform").value;
    const prompt = document.getElementById("prompt").value;
    chrome.storage.local.set({ platform, prompt }, () =>
      alert("Settings saved!")
    );
  };
});
