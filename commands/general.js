import { buildMenu } from "../lib/menu.js";

function formatDuration(seconds) {
  let remaining = Math.max(0, Math.floor(Number(seconds) || 0));
  const days = Math.floor(remaining / 86400);
  remaining %= 86400;
  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const parts = [];
  if (days) parts.push(days + "d");
  if (hours) parts.push(hours + "h");
  if (minutes) parts.push(minutes + "m");
  if (secs || !parts.length) parts.push(secs + "s");
  return parts.join(" ");
}

function messageTimestampMs(message) {
  const raw = message && message.messageTimestamp;
  const value = raw && typeof raw.toNumber === "function" ? raw.toNumber() : Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value > 1000000000000 ? value : value * 1000;
}

function ownerNumber(config) {
  const owners = Array.isArray(config.ownerNumbers) ? config.ownerNumbers : [];
  return String(owners[0] || "").replace(/\D/g, "");
}

const commands = [
  {
    name: "menu",
    aliases: ["helpme"],
    category: "General",
    description: "Show the branded FEI XMD menu and available command sections.",
    run: async ctx => {
      const menu = buildMenu({ commands: ctx.commands, config: ctx.config, theme: ctx.theme });
      if (ctx.config.imageUrl) {
        try {
          await ctx.send({
            image: { url: ctx.config.imageUrl },
            caption: "🤖 *Fᴇɪ Xᴍᴅ — WʜᴀᴛsAᴘᴘ Bᴏᴛ ʙʏ BᴇɴFᴇɪ Tᴇᴄʜ*\n" +
              "Oғғɪᴄɪᴀʟ ᴘᴀɪʀɪɴɢ ᴘᴏʀᴛᴀʟ: " + ctx.config.botUrl + "\n" +
              "⚡ Pᴏᴡᴇʀᴇᴅ ʙʏ BᴇɴFᴇɪ Tᴇᴄʜ"
          });
        } catch (error) {
          console.warn("Fᴇɪ Xᴍᴅ ᴍᴇɴᴜ ᴀʀᴛᴡᴏʀᴋ ᴄᴏᴜʟᴅ ɴᴏᴛ ʙᴇ sᴇɴᴛ; ᴜsɪɴɢ ᴛʜᴇ ᴛᴇxᴛ ᴍᴇɴᴜ:", error?.message || error);
        }
      }
      await ctx.reply(menu);
    }
  },
  {
    name: "help",
    category: "General",
    description: "List registered commands and their descriptions.",
    run: async ctx => {
      const rows = (ctx.commands || [])
        .filter(command => !command.hidden)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(command => ctx.config.prefix + command.name + (command.description ? " — " + command.description : ""));
      const header = "📚 Fᴇɪ Xᴍᴅ Hᴇʟᴘ\n" + rows.length + " ʀᴇɢɪsᴛᴇʀᴇᴅ ᴄᴏᴍᴍᴀɴᴅs\n\n";
      const chunks = [];
      let current = header;
      for (const row of rows) {
        if (current.length + row.length + 1 > 3300) {
          chunks.push(current.trimEnd());
          current = "📚 Fᴇɪ Xᴍᴅ Hᴇʟᴘ (ᴄᴏɴᴛɪɴᴜᴇᴅ)\n\n";
        }
        current += row + "\n";
      }
      if (current.trim()) chunks.push(current.trimEnd());
      for (const chunk of chunks) await ctx.reply(chunk);
    }
  },
  {
    name: "ping",
    category: "General",
    description: "Check bot responsiveness and estimated message response time.",
    run: async ctx => {
      const timestamp = messageTimestampMs(ctx.msg);
      const responseMs = timestamp === null ? null : Math.max(0, Date.now() - timestamp);
      await ctx.reply([
        "╭━━〔 🏓 Fᴇɪ Xᴍᴅ · Pᴏɴɢ 〕━━╮",
        "┃ ✦ Sᴛᴀᴛᴜs: " + (ctx.connectionOpen ? "Oɴʟɪɴᴇ 🟢" : "Cᴏɴɴᴇᴄᴛɪɴɢ 🟡"),
        "┃ ✦ Rᴇsᴘᴏɴsᴇ: " + (responseMs === null ? "Uɴᴀᴠᴀɪʟᴀʙʟᴇ" : responseMs + " ms"),
        "┃ ✦ Uᴘᴛɪᴍᴇ: " + formatDuration(process.uptime()),
        "┃ ✦ Vᴇʀsɪᴏɴ: " + ctx.config.version,
        "╰━━━━━━━━━━━━━━━━━━━━━━╯"
      ].join("\n"));
    }
  },
  {
    name: "alive",
    aliases: ["uptime"],
    category: "General",
    description: "Show bot status, mode and uptime.",
    run: async ctx => {
      await ctx.reply(
        "✅ " + ctx.config.name + " ɪs " + (ctx.connectionOpen ? "ᴏɴʟɪɴᴇ." : "ᴄᴏɴɴᴇᴄᴛɪɴɢ.") +
        "\n🔐 Mᴏᴅᴇ: " + String(ctx.mode || "public").toUpperCase() +
        "\n⏱️ Uᴘᴛɪᴍᴇ: " + formatDuration(process.uptime()) +
        "\n⚡ Pᴏᴡᴇʀᴇᴅ ʙʏ " + ctx.config.ownerName
      );
    }
  },
  {
    name: "owner",
    category: "General",
    description: "Show Benfei Tech owner details.",
    run: async ctx => {
      const number = ownerNumber(ctx.config);
      await ctx.reply(
        "👑 Oᴡɴᴇʀ: " + ctx.config.ownerName +
        (number ? "\n📱 Oᴡɴᴇʀ ɴᴜᴍʙᴇʀ: +" + number : "")
      );
    }
  },
  {
    name: "support",
    category: "General",
    description: "Show support guidance for FEI XMD.",
    run: async ctx => {
      await ctx.reply(
        "🛟 " + ctx.config.name + " Sᴜᴘᴘᴏʀᴛ\nFᴏʀ sᴇᴛᴜᴘ ʜᴇʟᴘ ᴏʀ ʙᴜɢ ʀᴇᴘᴏʀᴛs, ᴄᴏɴᴛᴀᴄᴛ " +
        ctx.config.ownerName + ".\n\nGɪᴛHᴜʙ: https://github.com/Benfeitech/FEI-XMD"
      );
    }
  },
  {
    name: "time",
    category: "General",
    description: "Show the current server time in Nigeria.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).format(new Date());
      await ctx.reply("🕒 Nɪɢᴇʀɪᴀ Tɪᴍᴇ: " + value);
    }
  },
  {
    name: "date",
    category: "General",
    description: "Show the current date in Nigeria.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }).format(new Date());
      await ctx.reply("📅 Dᴀᴛᴇ ɪɴ Nɪɢᴇʀɪᴀ: " + value);
    }
  },
  {
    name: "version",
    category: "General",
    description: "Show FEI XMD version and connection status.",
    run: async ctx => {
      await ctx.reply(
        "🤖 " + ctx.config.name + " v" + ctx.config.version +
        "\n🟢 Sᴛᴀᴛᴜs: " + (ctx.connectionOpen ? "Oɴʟɪɴᴇ" : "Cᴏɴɴᴇᴄᴛɪɴɢ") +
        "\n🔐 Mᴏᴅᴇ: " + String(ctx.mode || "public").toUpperCase() +
        "\n📦 Bᴀɪʟᴇʏs: ᴏғғɪᴄɪᴀʟ WʜɪsᴋᴇʏSᴏᴄᴋᴇᴛs ɴᴘᴍ ᴘᴀᴄᴋᴀɢᴇ"
      );
    }
  },
  {
    name: "jid",
    aliases: ["id"],
    category: "General",
    description: "Show the current chat and message sender IDs.",
    run: async ctx => {
      await ctx.reply(
        "💬 Cʜᴀᴛ ID: " + ctx.jid +
        "\n👤 Sᴇɴᴅᴇʀ ID: " + (ctx.senderJid || "Uɴᴀᴠᴀɪʟᴀʙʟᴇ")
      );
    }
  },
  {
    name: "whoami",
    category: "General",
    description: "Show your WhatsApp sender information.",
    run: async ctx => {
      await ctx.reply(
        "👤 Nᴀᴍᴇ: " + (ctx.msg?.pushName || "Uɴᴋɴᴏᴡɴ") +
        "\n🆔 Yᴏᴜʀ ID: " + (ctx.senderJid || "Uɴᴀᴠᴀɪʟᴀʙʟᴇ") +
        "\n👑 Oᴡɴᴇʀ: " + (ctx.owner ? "Yᴇs" : "Nᴏ")
      );
    }
  }
];

export default commands;
