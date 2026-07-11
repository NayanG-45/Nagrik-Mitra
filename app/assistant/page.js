import ChatInterface from "@/components/ChatInterface";

export default function AssistantPage() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen relative flex flex-col items-center">
      {/* Animated Background Element */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      
      <div className="w-full relative z-10 flex-1 flex flex-col">
        <ChatInterface />
      </div>
    </div>
  );
}
