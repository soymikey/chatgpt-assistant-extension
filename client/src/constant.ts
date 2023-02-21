const HIGHLIGHTCONTENT = window.getSelection()?.toString()?.trim() || "";
const HOMETITLE = "ChatGPT Assistant";
const EDITTITLE = "Edit/Add prompt";
const CHATAPIERROR =
  "OpenAI API for corporate customers is down. Affecting all large users of OpenAI including Merlin. We are in talks with their support team to resolve it. This issue will be resolved in next few hours. Given this issue with OpenAI is now becoming frequent we are exploring other AI providers too so that Merlin users always get a live service. Thank you for your patience.";

export { HIGHLIGHTCONTENT, HOMETITLE, EDITTITLE, CHATAPIERROR };
