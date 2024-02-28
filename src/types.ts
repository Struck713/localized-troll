
export interface Member {
    username: string,
    public_flags: number,
    premium_type: number,
    id: string,
    global_name: string,
    discriminator: string,
    avatar_decoration_data: null,
    avatar: string
}

export interface ReferencedMessage {
    type: number,
    tts: boolean,
    timestamp: Date,
    pinned: boolean,
    mentions: Mention[],
    mention_roles: [],
    mention_everyone: boolean,
    id: string,
    flags: number,
    embeds: [],
    edited_timestamp: null,
    content: string,
    components: [],
    channel_id: string,
    author: Member,
    attachments: []
}

export interface Message {
  type: number,
  tts: boolean,
  timestamp: Date,
  referenced_message?: ReferencedMessage,
  pinned: boolean,
  nonce: string,
  mentions: Mention[],
  mention_roles: [],
  mention_everyone: boolean,
  member: Member,
  id: string,
  flags: number,
  embeds: [],
  edited_timestamp: null,
  content: string,
  components: [],
  channel_id: string,
  author: {
    username: string,
    public_flags: number,
    premium_type: number,
    id: string,
    global_name: string,
    discriminator: string,
    avatar_decoration_data: null,
    avatar: string
  },
  attachments: [],
  guild_id: string
}

export interface QueuedMessage {
  channel_id: string;
  message_id: string;
  content: string;
}

export interface Mention {
    username: string,
    public_flags: number,
    member: Member,
    id: string,
    global_name: string,
    discriminator: string,
    avatar_decoration_data: null,
    avatar?: string
  }