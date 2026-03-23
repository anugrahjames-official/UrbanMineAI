
import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/actions/user";
import { getOrCreateChatTransaction } from "@/app/actions/chat";

export default async function RecyclerChatPage({ params }: { params: Promise<{ transactionId: string }> }) {
  const { transactionId: rawId } = await params;

  // Resolve or create transaction if needed
  let transactionId: string;
  try {
    transactionId = await getOrCreateChatTransaction(rawId);
  } catch (err) {
    return <div className="p-8 text-center text-red-500 font-bold">Error: {(err as Error).message}</div>;
  }

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
    return <div>Transaction not found</div>;
  }

  // Verify access (either buyer or supplier)
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

  // Format messages for AI SDK
  const initialMessages = messages?.map(m => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: new Date(m.created_at)
  })) || [];

  return (
    <div className="h-[calc(100vh-120px)]">
      <ChatInterface
        transaction={transaction}
        initialMessages={initialMessages}
        userProfile={profile}
      />
    </div>
  );
}
