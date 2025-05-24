# AI_Summarizer
A Chrome extension that enhances YouTube video pages by showing the video transcript in a movable sidebar and allowing you to quickly summarize the transcript using popular AI platforms like ChatGPT, Gemini, or Claude.

Features
->Transcript Sidebar: Displays the YouTube video's transcript (if available) in a draggable sidebar on the right side of the page.

->Summarize Button: Adds a "Summarize" button below the video player. When clicked, it fetches the transcript and copies a prompt to your clipboard ready for AI summarization.

->Multiple AI Platforms Supported: Works with ChatGPT, Gemini, and Claude by opening their respective websites and pasting the prompt.

->User Preferences: Allows you to configure your preferred AI platform and custom prompt via extension options.

->Responsive to URL Changes: Automatically detects when you navigate between videos or leave the video page, cleaning up UI elements accordingly to avoid duplicates or leftovers.

->Clipboard Support: Copies transcript or summary prompt directly to your clipboard for easy pasting.

->Sidebar Controls: The sidebar includes buttons to copy transcript, open settings, close sidebar, and move the sidebar around the screen.

How It Works
1.Injection on YouTube Video Pages:
The extension injects a sidebar and summarize button only when a YouTube video page (URL contains watch?v=) is loaded.

2.Transcript Loading:
It polls the YouTube transcript segments for up to 60 seconds and updates the sidebar with the transcript text once available. If no transcript is found, it notifies the user.

3.Summarize Function:
When you click the "Summarize" button, the extension:

->Fetches the transcript from the sidebar.

->Retrieves your configured AI platform and prompt.

->Copies a summary prompt (including the transcript) to your clipboard.

->Opens a new tab to the selected AI platform's website for you to paste and generate the summary.

4.URL Change Handling:
When you navigate to another video or leave a video page, the extension removes the sidebar and summarize button to keep the UI clean. It reinjects these elements only if you are on a video page.

Usage
1.Install the extension in Chrome (load unpacked in developer mode or package and publish).

2.Open any YouTube video.
The transcript sidebar and summarize button will automatically appear.

3.View transcript:
The sidebar shows the transcript if available. If not, follow YouTube's instructions to enable transcripts.

4.Copy transcript:
Use the "Copy" button in the sidebar to copy the full transcript to clipboard.

5.Summarize transcript:
Click the "Summarize" button below the video. This copies a prompt containing the transcript to your clipboard and opens your chosen AI platform for summarization.

6.Configure preferences:
Click the ⚙️ button in the sidebar or open the extension's options page to set your AI platform (ChatGPT, Gemini, Claude) and customize the prompt template.

7.Close or move sidebar:
Use the ✖️ button to close the sidebar, and drag the header to reposition it.

Notes
->The extension requires transcript availability on YouTube. If transcripts are not enabled or present, it will notify you.

->The extension only injects UI elements on YouTube video pages (watch?v= URLs).

->You must configure your AI platform and prompt in the extension options for the summarize feature to work correctly.

->The extension cleans up UI elements when navigating away from video pages to avoid clutter.

Troubleshooting
->If the sidebar or summarize button does not appear, make sure you are on a valid YouTube video page.

->If you navigate quickly between videos and see duplicated buttons, reload the page to reset.

->Ensure clipboard permissions are granted for copy features to work.

->Check the console (Ctrl+Shift+J) for any errors related to extension execution.

License
This project is open-source and free to use and modify.
