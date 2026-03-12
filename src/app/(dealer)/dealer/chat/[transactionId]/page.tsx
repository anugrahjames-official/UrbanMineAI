
import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/actions/user";

export default async function ChatPage({ params }: { params: Promise<{ transactionId: string }> }) {
  const { transactionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch Transaction Details
  const { data: transaction, error } = await supabase
    .from('transactions')
    .select(`
        *,
        items (*)
    `)
    .eq('id', transactionId)
    .single();

  if (error || !transaction) {
    // Handle error or redirect
    return <div>Transaction not found</div>;
  }

  // Verify access
  if (transaction.supplier_id !== user.id && transaction.buyer_id !== user.id) {
    return <div>Unauthorized access to this transaction</div>;
  }

  // Fetch Chat History
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('transaction_id', transactionId)
    .order('created_at', { ascending: true });

  const profile = await getUserProfile();

  // Format messages for AI SDK (id, role, content)
  const initialMessages = messages?.map(m => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: new Date(m.created_at)
  })) || [];

  return (
    <ChatInterface
      transaction={transaction}
      initialMessages={initialMessages}
      userProfile={profile}
    />
  );
}
