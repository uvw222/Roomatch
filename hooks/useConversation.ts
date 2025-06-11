// hooks/useConversation.ts
import { useEffect, useState } from "react";
import { getSocketClient } from "@/lib/socketClient";
import useSWR from "swr";

export function useConversation(me: string, other: string) {
  const { data, mutate } = useSWR(
    `/api/messages/list?mode=conversation&other=${other}`,
  );
  const [messages, setMessages] = useState<any[]>(data?.messages ?? []);

  /* keep local state in sync with SWR data */
  useEffect(() => {
    if (data?.messages) setMessages(data.messages);
  }, [data]);

  /* real-time socket */
  useEffect(() => {
    const socket = getSocketClient(me);
const onNew = (msg: any) => {
      // only append if it belongs to the open convo
      if (
        (msg.from === me && msg.to === other) ||
        (msg.from === other && msg.to === me)
      ) {
        setMessages((prev) => [...prev, msg]);
      } else {
        // different convo → let SWR update badges later
      }
    };

 // partner marked messages as read
    const onRead = () => mutate();            // cheap re-fetch

    socket.on("messages:new", onNew);
    socket.on("messages:read", onRead);

    return () => {
      socket.off("messages:new", onNew);
      socket.off("messages:read", onRead);
    };
  }, [me, other, mutate]);

  return { messages, setMessages, mutate };


    /*
    const refresh = () => mutate();
    socket.on("messages:new", refresh);
    socket.on("messages:read", refresh);

    return () => {
      socket.off("messages:new", refresh);
      socket.off("messages:read", refresh);
    };
  }, [me, mutate]);

  return { messages, setMessages, mutate };*/
}
