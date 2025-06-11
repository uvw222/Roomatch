// lib/bubbleClasses.ts
export const bubbleClasses = (mine: boolean, read: boolean) => [
  "rounded-2xl px-3 py-2 max-w-[75%] break-words",
  mine ? "self-end bg-orange-400 text-white" : "self-start bg-gray-200 text-black",
  read ? "" : "border-2 border-blue-500",
].join(" ");
