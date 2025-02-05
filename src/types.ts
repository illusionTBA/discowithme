export type WebhookInfo = {
  application_id: null;
  avatar: string | null;
  channel_id: string;
  guild_id: string;
  id: string;
  name: string;
  type: number;
  token: string;
  url: string;
};

export type ModifyWebhook = {
  name: string;
  avatar: string;
};

export type Message = {
  content: string;
  username: string;
  avatar_url: string;
  embeds?: Embed[];
  tts?: boolean;
};

export type Embed = {
  title: string;
  type: "rich";
  description: string;
  url: string;
  color: number;
  timestamp: string;
  footer: {
    text: string;
    icon_url: string;
    proxy_icon_url: string;
  };

  image: {
    url: string;
    proxy_url: string;
    height: number;
    width: number;
  };
  thumbnail: {
    url: string;
    proxy_url: string;
    height: number;
    width: number;
  };
  author: {
    name: string;
    url: string;
    icon_url: string;
    proxy_icon_url?: string;
  };
  fields: Field[];
};

export type Field = {
  name: string;
  value: string;
  inline: boolean;
};
