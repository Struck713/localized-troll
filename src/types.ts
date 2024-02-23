
export interface Message {
  type: number,
  tts: boolean,
  timestamp: Date,
  referenced_message: null,
  pinned: boolean,
  nonce: string,
  mentions: [],
  mention_roles: [],
  mention_everyone: boolean,
  member: {
    roles: string[],
    premium_since: null,
    pending: boolean,
    nick: string,
    mute: boolean,
    joined_at: Date,
    flags: number,
    deaf: boolean,
    communication_disabled_until: null,
    avatar: null
  },
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
