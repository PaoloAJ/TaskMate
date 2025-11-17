import { redirect } from "next/navigation";

// Redirect the index of /buddy to the chat tab
export default function BuddyIndex() {
  redirect('/buddy/chat');
}
