import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Skull, Bot, NotebookPen } from "lucide-react";
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
      await sendMessage(message);
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
      <div className="flex flex-col items-center justify-center h-screen space-y-2">
        <h1 className="text-3xl font-bold">Disco With Me 🕺</h1>
        <p className="text-center">
          No data is <span className="font-bold">EVER</span> stored or sent to
          some random server.
        </p>

        {webhook.length > 0 ? (
          <Tabs defaultValue="info" className="sm:w-auto md:w-5/12 w-10/12 p-2">
            <TabsList className="flex flex-row items-center justify-center gap-2 bg-muted/10">
              <TabsTrigger
                value="info"
                className="flex flex-row items-center justify-center gap-1"
              >
                <Info className="w-4 h-4" /> Info
              </TabsTrigger>
              <TabsTrigger
                value="delete"
                className="flex flex-row items-center justify-center gap-1"
              >
                <Skull className="w-4 h-4" />
                Delete
              </TabsTrigger>
              <TabsTrigger
                value="spam"
                className="flex flex-row items-center justify-center gap-1"
              >
                <Bot className="w-4 h-4" />
                Spam
              </TabsTrigger>
              <TabsTrigger
                value="edit"
                className="flex flex-row items-center justify-center gap-1"
              >
                <NotebookPen className="w-4 h-4" />
                Edit
              </TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="bg-muted/10">
              {/* display webhook info */}
              <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                <div className="flex flex-col justify-center gap-2 w-11/12 p-2 text-left ">
                  <p className="text-left">
                    Name:{" "}
                    <code
                      className="font-bold cursor-pointer"
                      onClick={() => copy(webhookInfo?.name ?? "")}
                    >
                      {webhookInfo?.name}
                    </code>
                  </p>
                  <p className="text-left flex space-x-1">
                    <span>Avatar:</span>
                    {webhookInfo?.avatar ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${webhookInfo?.id}/${webhookInfo?.avatar}.webp?size=80`}
                        className="w-7 h-7 rounded-full cursor-pointer"
                        onClick={() =>
                          copy(
                            `https://cdn.discordapp.com/avatars/${webhookInfo?.id}/${webhookInfo?.avatar}.webp?size=4096`
                          )
                        }
                        alt="No avatar"
                      />
                    ) : (
                      <span className="text-muted">No avatar</span>
                    )}
                  </p>
                  <p className="text-left">
                    ID:{" "}
                    <code
                      className="font-bold cursor-pointer"
                      onClick={() => copy(webhookInfo?.id ?? "")}
                    >
                      {webhookInfo?.id}
                    </code>
                  </p>
                  <p className="text-left flex space-x-1">
                    <span>token:</span>
                    <code
                      className="font-bold cursor-pointer min-w-full max-w-full text-ellipsis text-xs"
                      onClick={() => copy(webhookInfo?.token ?? "")}
                    >
                      {webhookInfo?.token}
                    </code>
                  </p>
                  <p className="text-left flex space-x-1">
                    <span>Channel ID:</span>
                    <code
                      className="font-bold cursor-pointer"
                      onClick={() => copy(webhookInfo?.channel_id ?? "")}
                    >
                      {webhookInfo?.channel_id}
                    </code>
                  </p>
                  <p className="text-left flex space-x-1">
                    <span>Guild ID:</span>
                    <code
                      className="font-bold cursor-pointer"
                      onClick={() => copy(webhookInfo?.guild_id ?? "")}
                    >
                      {webhookInfo?.guild_id}
                    </code>
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="delete" className="h-full">
              <div className="flex flex-col items-center justify-center bg-muted/10 h-full w-full ">
                <Button
                  onClick={deleteWebhook}
                  variant={"destructive"}
                  className="space-x-2 flex"
                >
                  <Skull className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="spam" className="h-full">
              <div className="flex flex-col items-center justify-center bg-muted/10 h-full w-full space-y-2">
                <div className="flex flex-col space-y-2 items-center justify-center w-full">
                  <h2>Message to spam</h2>
                  <Input
                    placeholder="Message to spam"
                    value={message.content}
                    onChange={(e) =>
                      setMessage({ ...message, content: e.target.value })
                    }
                    className="w-6/12 p-2"
                  />
                </div>

                <div className="w-full flex justify-center items-center">
                  <div className="flex flex-col justify-center items-center space-y-2 w-full">
                    <h2>Username</h2>
                    <Input
                      placeholder="Username"
                      value={message.username}
                      onChange={(e) =>
                        setMessage({ ...message, username: e.target.value })
                      }
                      className="w-9/12 p-2"
                    />
                  </div>
                  <div className="flex flex-col justify-center items-center space-y-2 w-full">
                    <h2>Avatar URL</h2>
                    <Input
                      placeholder="Avatar URL"
                      value={message.avatar_url}
                      onChange={(e) =>
                        setMessage({ ...message, avatar_url: e.target.value })
                      }
                      className="w-9/12 p-2"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center w-full">
                  <h2>Delay (ms)</h2>
                  <Input
                    placeholder="Delay"
                    onChange={(e) => setDelay(parseInt(e.target.value))}
                    className="w-6/12 p-2"
                  />
                </div>
                {isSpamming ? (
                  <Button
                    onClick={() => {
                      clearInterval(spamInterval);
                      setSpamInterval(undefined);
                      setIsSpamming(false);
                      toast.info("Spam stopped");
                    }}
                    variant={"secondary"}
                    className="space-x-2 flex"
                  >
                    <Pause className="w-4 h-4" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    onClick={spam}
                    variant={"secondary"}
                    className="space-x-2 flex"
                  >
                    <Bot className="w-4 h-4" />
                    Start
                  </Button>
                )}
              </div>
            </TabsContent>
            <TabsContent value="edit" className="h-full">
              <div className="flex flex-col items-center justify-center bg-muted/10 h-full w-full space-y-2">
                <div className="flex flex-col space-y-2 items-center justify-center w-full">
                  <h2>Name</h2>
                  <Input
                    placeholder="Name"
                    value={editWebhook?.name ?? ""}
                    onChange={(e) =>
                      // @ts-expect-error ts tragic
                      setEditWebhook({ ...editWebhook, name: e.target.value })
                    }
                    className="w-9/12 p-2"
                  />
                </div>
                <div className="flex flex-col space-y-2 items-center justify-center w-full">
                  <h2>Avatar</h2>
                  <Input
                    placeholder="Avatar URL"
                    onChange={(e) => {
                      // get file from input
                      if (!e.target.files) return;
                      const file = e.target.files[0];
                      // convert to base64
                      console.log(file);
                      toBase64(file).then((base64) => {
                        // @ts-expect-error ts tragic
                        setEditWebhook({ ...editWebhook, avatar: base64 });
                      });
                    }}
                    type="file"
                    className="w-9/12 p-2"
                  />
                </div>

                <Button
                  onClick={modifyWebhook}
                  variant={"secondary"}
                  className="space-x-2 flex"
                >
                  <Check className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex md:flex-row flex-col items-center justify-center gap-2 w-full">
            <Input
              placeholder="Webhook URL"
              value={temp}
              className="md:w-2/12 w-11/12 p-2"
              onChange={(e) => setTemp(e.target.value)}
            />
            <Button onClick={checkWebhook} className="w-11/12 md:w-fit">
              <Check className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <footer className="flex items-center justify-center h-12 fixed w-full bottom-0 ">
        <p>
          Made with ❤️ by{" "}
          <a
            href="https://github.com/illusionTBA/discowithme"
            className="text-primary underline"
          >
            illusionTBA
          </a>
        </p>
      </footer>
    </>
  );
}

export default App;
