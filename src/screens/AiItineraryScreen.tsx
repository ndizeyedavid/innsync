import { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
  Alert,
  Image,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import aiService, { ChatMessage } from "../services/ai.service";
import aiSessionService, {
  AiSession,
  AiSessionMeta,
} from "../services/ai-session.service";
import { useToast } from "../contexts/ToastContext";
import SkeletonBase from "../components/SkeletonBase";
import TypewriterText from "../components/AiComponents/TypewriterText";
import MarkdownText from "../components/AiComponents/MarkdownText";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export default function AiItineraryScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [session, setSession] = useState<AiSession>(() =>
    aiSessionService.createSession(),
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSessionList, setShowSessionList] = useState(false);
  const [sessions, setSessions] = useState<AiSessionMeta[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const suggestedPrompts = aiService.getSuggestedPrompts();

  const scrollToBottom = useCallback((smooth = true) => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: smooth });
    }, 50);
  }, []);

  // Load sessions list
  const refreshSessions = useCallback(async () => {
    const list = await aiSessionService.listSessions();
    setSessions(list);
  }, []);

  // Load session list on mount
  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // Persist session after messages change
  const persistSession = useCallback(
    async (msgs: ChatMessage[]) => {
      if (msgs.length === 0) return;
      const title = aiSessionService.generateTitle(msgs);
      const updated: AiSession = {
        ...session,
        title,
        messages: msgs,
        updatedAt: new Date().toISOString(),
      };
      setSession(updated);
      await aiSessionService.saveSession(updated);
      await refreshSessions();
    },
    [session, refreshSessions],
  );

  // Auto-save when streaming finishes
  useEffect(() => {
    if (!isStreaming && messages.length > 0) {
      persistSession(messages);
    }
  }, [isStreaming]);

  const handleSend = useCallback(
    async (text?: string) => {
      const query = (text || input).trim();
      if (!query || isStreaming) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setInput("");
      Keyboard.dismiss();

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        text: query,
      };

      const aiMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        text: "",
      };

      const newMessages = [...messages, userMessage, aiMessage];
      setMessages(newMessages);
      setIsStreaming(true);
      scrollToBottom();

      try {
        const history = [...messages, userMessage].map((m) => ({
          role: m.role,
          text: m.text,
        }));

        let accumulated = "";
        await aiService.tripPlan(query, history, (chunk) => {
          accumulated += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessage.id ? { ...m, text: accumulated } : m,
            ),
          );
          scrollToBottom();
        });
      } catch (error: any) {
        const errorText =
          error?.message || "Sorry, I couldn't process that. Please try again.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessage.id
              ? { ...m, text: `⚠️ ${errorText}` }
              : m,
          ),
        );
        showToast("error", "AI response failed");
      } finally {
        setIsStreaming(false);
      }
    },
    [input, isStreaming, messages, scrollToBottom, showToast],
  );

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    handleSend(prompt);
  };

  const handleNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSession(aiSessionService.createSession());
    setMessages([]);
    setShowSessionList(false);
  };

  const handleLoadSession = async (meta: AiSessionMeta) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const loaded = await aiSessionService.loadSession(meta.id);
    if (loaded) {
      setSession(loaded);
      setMessages(loaded.messages);
      setShowSessionList(false);
    }
  };

  const handleDeleteSession = (meta: AiSessionMeta) => {
    Alert.alert("Delete chat", `Delete "${meta.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await aiSessionService.deleteSession(meta.id);
          await refreshSessions();
          if (session.id === meta.id) {
            handleNewChat();
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-3 ">
          <TouchableOpacity
            onPress={() => router.back()}
            className="size-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="#283D5A" />
          </TouchableOpacity>
          <View className="">
            <Text className="text-lg font-semibold text-navy" numberOfLines={1}>
              {session.title === "New chat" ? "AI Itinerary" : session.title}
            </Text>
            <Text className="text-xs text-gray-400">
              {messages.length > 0
                ? `${messages.length} messages`
                : "Plan your trip with AI"}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1">
          <TouchableOpacity
            onPress={() => {
              refreshSessions();
              setShowSessionList(true);
            }}
            className="size-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Ionicons name="list" size={20} color="#283D5A" />
          </TouchableOpacity>
          {messages.length > 0 && (
            <TouchableOpacity onPress={handleNewChat} className="size-10 bg-gray-100 rounded-full items-center justify-center">
              <Ionicons name="add" size={22} color="#283D5A" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View className="flex-1 pt-8">
            {/* Welcome */}
            <View className="items-center mb-8">
              <View className="items-center justify-center mb-4">
                <Image 
                source={require('../assets/images/logo/logo-ai.png')} 
                style={{width: 130, height: 130}} 
                resizeMode="cover"
                />
              </View>
              <Text className="text-2xl font-semibold text-navy text-center">
                Innsync AI
              </Text>
              <Text className="text-gray-500 text-center mt-2 px-4">
                Tell me what kind of trip you want — I'll build a complete
                itinerary with activities, dining, and accommodations.
              </Text>
            </View>

            {/* Past sessions */}
            {sessions.length > 0 && (
              <View className="mb-6">
                <Text className="text-sm text-gray-400 mb-2 px-1">
                  Recent chats:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row"
                  contentContainerStyle={{ gap: 10 }}
                >
                  {sessions.slice(0, 5).map((meta) => (
                    <TouchableOpacity
                      key={meta.id}
                      onPress={() => handleLoadSession(meta)}
                      className="bg-navy rounded-2xl px-4 py-3 max-w-[200]"
                    >
                      <Text
                        className="text-white text-[13px] font-medium"
                        numberOfLines={2}
                      >
                        {meta.title}
                      </Text>
                      <Text className="text-gray-400 text-[11px] mt-1">
                        {meta.messageCount} msgs · {formatDate(meta.updatedAt)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Suggested prompts */}
            {/* <Text className="text-sm text-gray-400 mb-3 px-1">
              Try asking:
            </Text>
            <View className="gap-2 hidden">
              {suggestedPrompts.map((prompt, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleSuggestedPrompt(prompt)}
                  className="flex-row items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 active:bg-gray-100"
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={18}
                    color="#4ab3de"
                  />
                  <Text className="text-gray-700 flex-1 text-[15px]">
                    {prompt}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View> */}
          </View>
        ) : (
          <View className="gap-4">
            {messages.map((msg) => (
              <View
                key={msg.id}
                className={`flex-row gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <View className="size-[50px] rounded-full items-center justify-center mt-1">
                    <Image 
                source={require('../assets/images/logo/logo-ai.png')} 
                style={{width: 45, height: 45}} 
                resizeMode="cover"
                />
                  </View>
                )}
                <View
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-navy rounded-tr-sm"
                      : "bg-gray-100 rounded-tl-sm"
                  }`}
                >
                  {msg.role === "user" ? (
                    <Text className="text-[15px] leading-5 text-white">
                      {msg.text}
                    </Text>
                  ) : msg.text ? (
                    <TypewriterText text={msg.text} speed={7}>
                      {(displayedText) => (
                        <MarkdownText
                          text={displayedText}
                          textClassName="text-[15px] leading-5 text-gray-800"
                        />
                      )}
                    </TypewriterText>
                  ) : (
                    <View className="flex-row gap-1 py-1">
                      <SkeletonBase
                        width={8}
                        height={8}
                        borderRadius={4}
                        className="!bg-gray-400"
                      />
                      <SkeletonBase
                        width={8}
                        height={8}
                        borderRadius={4}
                        className="!bg-gray-400"
                      />
                      <SkeletonBase
                        width={8}
                        height={8}
                        borderRadius={4}
                        className="!bg-gray-400"
                      />
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input bar */}
      <View className="px-4 pb-4 pt-2 bg-white border-t border-gray-100">
        <View className="flex-row items-center gap-2">
          <TextInput
            ref={inputRef}
            value={input}
            onChangeText={setInput}
            placeholder="Describe your trip..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-[15px] text-gray-800 max-h-[100px]"
            multiline
            editable={!isStreaming}
            onSubmitEditing={() => handleSend()}
            blurOnSubmit
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className={`size-12 rounded-full items-center justify-center ${
              input.trim() && !isStreaming ? "bg-navy" : "bg-gray-200"
            }`}
          >
            <Ionicons
              name={isStreaming ? "hourglass" : "send"}
              size={20}
              color={input.trim() && !isStreaming ? "white" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>
        <Text className="text-xs text-gray-400 text-center mt-2">
          Powered by {aiService.activeProvider}
        </Text>
      </View>

      {/* Session List Modal */}
      <Modal
        visible={showSessionList}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSessionList(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-4 pt-14 pb-3 bg-white border-b border-gray-100">
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => setShowSessionList(false)}
                className="size-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={22} color="#283D5A" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-navy">
                Chat History
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleNewChat}
              className="bg-navy rounded-full px-4 py-2 flex-row items-center gap-1"
            >
              <Ionicons name="add" size={18} color="white" />
              <Text className="text-white text-[13px] font-medium">
                New Chat
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4 pt-4">
            {sessions.length === 0 ? (
              <View className="items-center pt-20">
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color="#D1D5DB"
                />
                <Text className="text-gray-400 mt-4 text-[15px]">
                  No chat history yet
                </Text>
                <Text className="text-gray-400 text-[13px] mt-1">
                  Start a new conversation to plan your trip
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {sessions.map((meta) => (
                  <TouchableOpacity
                    key={meta.id}
                    onPress={() => handleLoadSession(meta)}
                    onLongPress={() => handleDeleteSession(meta)}
                    className={`flex-row items-center p-4 rounded-2xl ${
                      session.id === meta.id
                        ? "bg-navy"
                        : "bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <View
                      className={`size-10 rounded-full items-center justify-center mr-3 ${
                        session.id === meta.id ? "bg-white/20" : "bg-gray-200"
                      }`}
                    >
                      <Ionicons
                        name="chatbubble-ellipses"
                        size={18}
                        color={session.id === meta.id ? "white" : "#283D5A"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-[15px] font-medium ${
                          session.id === meta.id
                            ? "text-white"
                            : "text-gray-800"
                        }`}
                        numberOfLines={1}
                      >
                        {meta.title}
                      </Text>
                      <Text
                        className={`text-[12px] ${
                          session.id === meta.id
                            ? "text-gray-300"
                            : "text-gray-400"
                        }`}
                      >
                        {meta.messageCount} messages ·{" "}
                        {formatDate(meta.updatedAt)}
                      </Text>
                    </View>
                    {session.id === meta.id && (
                      <View className="bg-white/20 rounded-full px-2 py-1">
                        <Text className="text-white text-[11px]">Active</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View className="h-8" />
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
