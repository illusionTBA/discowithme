import { Info, Skull, Bot, NotebookPen, Volume2 } from "lucide-react";
import { Input } from "./components/ui/input";
import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { Check, Pause } from "lucide-react";
import { toast } from "sonner";
import type {
  WebhookInfo,
  Message as MessageType,
  ModifyWebhook,
} from "./types";

function App() {
  const [webhook, setWebhook] = useState("");
  const [temp, setTemp] = useState("");
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo>();
  const [message, setMessage] = useState<MessageType>({
    content: "",
    username: "Disco With Me",
    avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png",
  });
  const [editWebhook, setEditWebhook] = useState<ModifyWebhook>();
  const [delay, setDelay] = useState(1000);
  const [isSpamming, setIsSpamming] = useState(false);
  const [isTTS, setIsTTS] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const [spamInterval, setSpamInterval] = useState<NodeJS.Timeout>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let webhook = params.get("webhook");
    if (!webhook) return;
    if (!/discord(app)?\.com\/api\/webhooks\//.test(webhook)) {
      toast.error("Invalid webhook");
      return;
    }
    (async () => {
      if (!webhook.startsWith("http")) {
        webhook = `https://${webhook}`;
      }
      const res = await fetch(webhook);
      if (res.status !== 200) {
        toast.error(`Invalid webhook: ${res.status}`);
        return;
      }

      const data = await res.json();
      setWebhookInfo(data);
      toast.success("Valid webhook");
      setWebhook(webhook);
      setTemp("");
    })();
  }, []);

  useEffect(() => {
    if (isSpamming) {
      clearInterval(spamInterval);
      const interval = setInterval(async () => {
        await sendMessage({ ...message, tts: isTTS });
        console.log("sent");
      }, delay);
      setSpamInterval(interval);
    }
  }, [isTTS]);

  const checkWebhook = async () => {
    let t = temp;
    if (!/discord(app)?\.com\/api\/webhooks\//.test(t)) {
      toast.error("Invalid webhook");
      return;
    }

    if (!t.startsWith("http")) {
      t = `https://${t}`;
    }

    const res = await fetch(t);
    if (res.status !== 200) {
      toast.error(`Invalid webhook: ${res.status}`);
      return;
    }

    const data = await res.json();
    setWebhookInfo(data);
    toast.success("Valid webhook");
    setWebhook(t);
    setTemp("");
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const deleteWebhook = async () => {
    if (!webhookInfo) return;
    const res = await fetch(webhook, {
      method: "DELETE",
    });

    if (res.status !== 204) {
      toast.error(`Failed to delete webhook: ${res.status}`);
      return;
    }

    toast.success("Webhook deleted");
    setWebhook("");
    setWebhookInfo(undefined);
  };

  const spam = async () => {
    if (!webhookInfo) return;
    setIsSpamming(true);
    const interval = setInterval(async () => {
      await sendMessage({ ...message, tts: isTTS });
      console.log("sent");
    }, delay);
    setSpamInterval(interval);
    console.log(spamInterval);
  };

  const sendMessage = async (data: MessageType) => {
    if (!webhookInfo) return;
    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: data.content,
        username: data.username,
        avatar_url: data.avatar_url,
        embeds: data.embeds,
        tts: data.tts,
        allowed_mentions: {
          parse: ["users", "roles", "everyone"],
        },
      }),
    });

    if (res.status === 429) {
      toast.error("You are being rate limited");
      return;
    }

    if (res.status !== 204) {
      toast.error(`Failed to send message: ${res.status}`);
      console.log(res);
      return;
    }

    toast.success("Message sent");
  };

  const modifyWebhook = async () => {
    if (!webhookInfo || !editWebhook) return;
    const res = await fetch(webhook, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: editWebhook.name,
        avatar: editWebhook.avatar,
      }),
    });

    if (res.status !== 200) {
      toast.error(`Failed to modify webhook: ${res.status}`);
      return;
    }
    const data = await res.json();
    // update webhook info
    setWebhookInfo(data);
    toast.success("Webhook modified");
  };
  const toBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen space-y-6">
        <h1 className="text-4xl font-bold">Disco With Me 🕺</h1>
        <p className="text-center text-lg">
          No data is <span className="font-bold">EVER</span> stored or sent to
          some random server.
        </p>

        {webhook.length > 0 ? (
          <div className="w-full max-w-2xl p-6 bg-[#0e0e0e] rounded-lg">
            <div className="flex justify-around bg-[#0e0e0e] p-3 rounded-lg mb-4">
              <Button
                onClick={() => setActiveTab("info")}
                className={`flex items-center gap-2 px-4 py-2 rounded ${
                  activeTab === "info" ? "bg-[#161616] text-white" : "bg-[#161616]"
                }`}
              >
                Info
              </Button>
              <Button
                onClick={() => setActiveTab("spam")}
                className={`flex items-center gap-2 px-4 py-2 rounded ${
                  activeTab === "spam" ? "bg-[#161616] text-white" : "bg-[#161616]"
                }`}
              >
                 Main
              </Button>
              <Button
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-2 px-4 py-2 rounded ${
                  activeTab === "edit" ? "bg-[#161616] text-white" : "bg-[#161616]"
                }`}
              >
                Edit
              </Button>
            </div>
            {activeTab === "info" && (
              <div className="bg-[#0e0e0e] p-4 rounded-lg">
                {/* display webhook info */}
                <div className="flex flex-col gap-3">
                  <p>
                    <span className="font-bold">Name:</span>{" "}
                    <code
                      className="cursor-pointer"
                      onClick={() => copy(webhookInfo?.name ?? "")}
                    >
                      {webhookInfo?.name}
                    </code>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="font-bold">Avatar:</span>
                    {webhookInfo?.avatar ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${webhookInfo?.id}/${webhookInfo?.avatar}.webp?size=80`}
                        className="w-10 h-10 rounded-full cursor-pointer"
                        onClick={() =>
                          copy(
                            `https://cdn.discordapp.com/avatars/${webhookInfo?.id}/${webhookInfo?.avatar}.webp?size=4096`
                          )
                        }
                        alt="No avatar"
                      />
                    ) : (
                      <span className="">No avatar</span>
                    )}
                  </p>
                  <p>
                    <span className="font-bold">ID:</span>{" "}
                    <code
                      className="cursor-pointer"
                      onClick={() => copy(webhookInfo?.id ?? "")}
                    >
                      {webhookInfo?.id}
                    </code>
                  </p>
                  <p>
                    <span className="font-bold">Channel ID:</span>{" "}
                    <code
                      className="cursor-pointer"
                      onClick={() => copy(webhookInfo?.channel_id ?? "")}
                    >
                      {webhookInfo?.channel_id}
                    </code>
                  </p>
                  <p>
                    <span className="font-bold">Guild ID:</span>{" "}
                    <code
                      className="cursor-pointer"
                      onClick={() => copy(webhookInfo?.guild_id ?? "")}
                    >
                      {webhookInfo?.guild_id}
                    </code>
                  </p>
                </div>
              </div>
            )}
            {activeTab === "spam" && (
              <div className="bg-[#0e0e0e] p-4 rounded-lg flex flex-col gap-4">
                <Input
                  placeholder="Message to spam"
                  value={message.content}
                  onChange={(e) =>
                    setMessage({ ...message, content: e.target.value })
                  }
                  className="w-full bg-[#161616]"
                />
                <Input
                  placeholder="Username"
                  value={message.username}
                  onChange={(e) =>
                    setMessage({ ...message, username: e.target.value })
                  }
                  className="w-full bg-[#161616]"
                />
                <Input
                  placeholder="Avatar URL"
                  value={message.avatar_url}
                  onChange={(e) =>
                    setMessage({ ...message, avatar_url: e.target.value })
                  }
                  className="w-full bg-[#161616]"
                />
                <Input
                  placeholder="Delay (ms)"
                  onChange={(e) => setDelay(parseInt(e.target.value))}
                  className="w-full bg-[#161616]"
                />
                <Button
                  onClick={() => setIsTTS(!isTTS)}
                  variant={isTTS ? "default" : "outline"}
                  className={`flex items-center gap-2 ${
                    isTTS ? "bg-white text-black" : "bg-[#161616] text-gray-400"
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                  {isTTS ? "TTS On" : "TTS Off"}
                </Button>
                {isSpamming ? (
                  <Button
                    onClick={() => {
                      clearInterval(spamInterval);
                      setSpamInterval(undefined);
                      setIsSpamming(false);
                      toast.info("Spam stopped");
                    }}
                    variant={"secondary"}
                    className="flex items-center gap-2 bg-[#161616]"
                  >
                    <Pause className="w-5 h-5" /> Stop
                  </Button>
                ) : (
                  <Button
                    onClick={spam}
                    variant={"outline"}
                    className="flex items-center gap-2 bg-white text-black"
                  >
                    <Bot className="w-5 h-5" /> Start
                  </Button>
                )}
                <Button
                  onClick={deleteWebhook}
                  variant={"destructive"}
                  className="flex items-center text-white gap-2 bg-[#b91c1c]"
                >
                  <Skull className="w-5 h-5" /> Delete
                </Button>
              </div>
            )}
            {activeTab === "edit" && (
              <div className="bg-[#0e0e0e] p-4 rounded-lg flex flex-col gap-4">
                <Input
                  placeholder="Name"
                  value={editWebhook?.name ?? ""}
                  onChange={(e) =>
                    setEditWebhook({ ...editWebhook, name: e.target.value, avatar: editWebhook?.avatar ?? "" })
                  }
                  className="w-full bg-[#161616]"
                />
                <Input
                  placeholder="Avatar URL"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    const file = e.target.files[0];
                    toBase64(file).then((base64) => {
                      setEditWebhook({ ...editWebhook, avatar: base64 as string, name: editWebhook?.name ?? "" });
                    });
                  }}
                  type="file"
                  className="w-full bg-[#161616]"
                />
                <Button
                  onClick={modifyWebhook}
                  variant={"secondary"}
                  className="flex items-center gap-2 bg-[#161616]"
                >
                  <Check className="w-5 h-5" /> Save
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <Input
              placeholder="Webhook URL"
              value={temp}
              className="w-full bg-[#161616]"
              onChange={(e) => setTemp(e.target.value)}
              aria-label="Webhook URL Input"
            />
            <Button
              onClick={checkWebhook}
              className="w-full bg-[#cccccc] text-black"
              aria-label="Check Webhook Button"
              variant={"outline"}
            >
              <Check className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      <footer className="flex items-center justify-center h-12 fixed w-full bottom-0 bg-muted/10">
        <p>
          Made with ❤️ by{" "}
          <a
            href="https://github.com/illusionTBA/discowithme"
            className="underline"
          >
            illusionTBA
          </a>
        </p>
      </footer>
    </>
  );
}

export default App;
