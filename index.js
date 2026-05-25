require("dotenv").config();
const express = require("express");
const app = express();
const axios = require("axios");
function limpiarUrl(url) {
  if (!url) return null;

  url = url.trim();

  const match = url.match(/\[img\](.*?)\[\/img\]/i);
  if (match) {
    url = match[1];
  }

  url = url.split("?")[0];

  const extensiones = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

  const valida = extensiones.some(ext =>
    url.toLowerCase().endsWith(ext)
  );

  if (!valida) return null;

  try {
    new URL(url);
    return url;
  } catch {
    return null;
  }
}

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const GUILD_ID = process.env.GUILD_ID;
const VERIFIED_ROLE_ID = process.env.VERIFIED_ROLE_ID;
const BASE_URL = process.env.BASE_URL;

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>012 Shop Verification</title>
  <style>
    body {
      margin: 0;
      background: radial-gradient(circle, #001133, #000);
      color: white;
      font-family: Arial, sans-serif;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      overflow: hidden;
    }

    .box {
      width: 700px;
      padding: 50px;
    }

    h1 {
      font-size: 48px;
      letter-spacing: 3px;
    }

    h1 span {
      color: #0066ff;
    }

    p {
      color: #aaa;
      font-size: 22px;
      margin-bottom: 40px;
    }

    .btn {
      display: inline-block;
      padding: 25px 90px;
      color: white;
      font-size: 28px;
      font-weight: bold;
      text-decoration: none;
      border-radius: 20px;
      border: 2px solid #00aaff;
      background: linear-gradient(120deg, #003cff, #00ccff, #003cff);
      background-size: 300% 300%;
      animation: waves 3s ease infinite;
      box-shadow: 0 0 35px #008cff;
    }

    @keyframes waves {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .footer {
      margin-top: 40px;
      color: #777;
      letter-spacing: 3px;
    }
  </style>
</head>
<body>
  <div class="box">
    <h1>VERIFICA TU CUENTA<br>DE <span>DISCORD</span></h1>
    <p>Para acceder al Discord</p>

    <a class="btn" href="/login">💬 VERIFICAR AHORA</a>

    <div class="footer">🛡️ 100% SEGURO • ⚡ RÁPIDO • 🔒 PROTEGIDO</div>
  </div>
</body>
</html>
  `);
});

app.get("/login", (req, res) => {
  const url =
    `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(BASE_URL + "/callback")}` +
    `&response_type=code&scope=identify`;

  res.redirect(url);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) return res.send("❌ Código inválido.");

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: BASE_URL + "/callback"
      })
    });

    const tokenData = await tokenResponse.json();

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const user = await userResponse.json();
    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(user.id);

    await member.roles.add(VERIFIED_ROLE_ID);
const ip =
  req.headers["x-forwarded-for"]?.split(",")[0] ||
  req.socket.remoteAddress;

let geo = {};

try {
  const ipResponse = await axios.get(
    `http://ip-api.com/json/${ip}?fields=country,city,isp,mobile,proxy,hosting,query`
  );
  geo = ipResponse.data;
} catch {
  geo = {};
}

const createdAt = new Date(
  Number((BigInt(user.id) >> 22n) + 1420070400000n)
);

const accountAgeDays = Math.floor(
  (Date.now() - createdAt.getTime()) / 86400000
);

let estadoCuenta = "🟢 Cuenta segura";

if (accountAgeDays < 7) {
  estadoCuenta = "🔴 Cuenta muy nueva";
} else if (accountAgeDays < 30) {
  estadoCuenta = "🟡 Cuenta reciente";
}

const nitro = user.avatar?.startsWith("a_") ? "Sí" : "No";

const ipOculta = geo.query
  ? geo.query.replace(/\.\d+$/, ".***")
  : "No disponible";

const avatarUrl = user.avatar
  ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
  : null;

const logChannel = await client.channels.fetch(process.env.VERIFY_LOG_CHANNEL_ID);

const logEmbed = new EmbedBuilder()
  .setColor("#006bff")
  .setTitle("✅ Nueva verificación")
  .setThumbnail(avatarUrl)
  .addFields(
    { name: "👤 Usuario", value: `<@${user.id}>`, inline: true },
    { name: "🆔 ID", value: user.id, inline: true },
    { name: "📛 Nombre", value: user.username, inline: true },
    { name: "🌍 País", value: geo.country || "Desconocido", inline: true },
    { name: "🏙️ Ciudad", value: geo.city || "Desconocida", inline: true },
    { name: "📡 ISP", value: geo.isp || "Desconocido", inline: true },
    { name: "📱 Móvil", value: geo.mobile ? "Sí" : "No", inline: true },
    { name: "🛡️ VPN/Proxy", value: geo.proxy || geo.hosting ? "Detectado" : "No detectado", inline: true },
    { name: "🌐 IP", value: ipOculta, inline: true },
    { name: "💎 Nitro", value: nitro, inline: true },
    { name: "📅 Cuenta creada", value: `<t:${Math.floor(createdAt.getTime() / 1000)}:F>`, inline: false },
    { name: "⏳ Antigüedad", value: `${accountAgeDays} días`, inline: true },
    { name: "✅ Rol entregado", value: `<@&${VERIFIED_ROLE_ID}>`, inline: true },
    { name: "🟢 Estado", value: estadoCuenta, inline: true }
  )
  .setFooter({ text: "012 Shop • Logs de verificación" })
  .setTimestamp();

await logChannel.send({ embeds: [logEmbed] });
res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Verificación completada</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at bottom left, rgba(0, 80, 255, 0.45), transparent 35%),
        radial-gradient(circle at bottom right, rgba(0, 80, 255, 0.35), transparent 35%),
        #02040a;
      color: white;
      font-family: Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .card {
      width: 850px;
      max-width: 90%;
      padding: 70px 45px;
      text-align: center;
      border: 1px solid rgba(0, 120, 255, 0.35);
      border-radius: 28px;
      background: rgba(5, 8, 18, 0.82);
      box-shadow: 0 0 45px rgba(0, 100, 255, 0.35);
    }

    .check {
      width: 110px;
      height: 110px;
      margin: 0 auto 30px;
      border-radius: 50%;
      border: 3px solid #00ff88;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 58px;
      color: #00ff88;
      box-shadow: 0 0 35px rgba(0, 255, 136, 0.55);
    }

    h1 {
      font-size: 44px;
      margin: 0;
      letter-spacing: 1px;
    }

    h1 span {
      color: #006bff;
    }

    p {
      font-size: 22px;
      color: #c9c9c9;
      margin: 18px 0 35px;
    }

    .info {
      margin: 0 auto 35px;
      padding: 22px;
      max-width: 600px;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 18px;
      background: rgba(255,255,255,0.04);
      color: #ddd;
      font-size: 18px;
    }

    .btn {
      display: inline-block;
      padding: 18px 55px;
      border-radius: 14px;
      text-decoration: none;
      color: white;
      font-size: 22px;
      font-weight: bold;
      background: linear-gradient(120deg, #003cff, #00b7ff, #003cff);
      background-size: 300% 300%;
      animation: wave 3s infinite ease;
      box-shadow: 0 0 28px rgba(0, 120, 255, 0.75);
    }

    @keyframes wave {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .footer {
      margin-top: 45px;
      display: flex;
      justify-content: center;
      gap: 45px;
      color: #aaa;
      font-size: 17px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="check">✓</div>

    <h1>Verificación <span>completada</span></h1>
    <p>Ya podés volver al Discord.</p>

    <div class="info">
      🛡️ Tu cuenta fue verificada correctamente.<br>
      Gracias por formar parte de nuestra comunidad.
    </div>

    <a class="btn" href="https://discord.com/channels/${GUILD_ID}">
      💬 Volver a Discord
    </a>

    <div class="footer">
      <div>🔒 Seguro</div>
      <div>⚡ Rápido</div>
      <div>👥 Comunidad</div>
    </div>
  </div>
</body>
</html>
`);
      } catch (error) {
   console.error("ERROR VERIFICACION:", error);
    res.send("❌ Error al verificar. Asegurate de estar dentro del servidor.");
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web de verificación activa en puerto ${PORT}`);
});
const STAFF_ROLE_ID = "1507132903442747535";
const TICKET_CATEGORY_ID = "1507133644962267299";

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
 TextInputStyle,
StringSelectMenuBuilder
 } = require("discord.js");
const discordTranscripts = require("discord-html-transcripts");

const LOG_CIERRES_ID = "1507137361895755886";
const LOG_CALIFICACIONES_ID = "1507138205781327922";
const VOUCHES_CHANNEL_ID = "1507143744124883087";
const carritos = new Map();
const productosPublicados = new Map();
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
new SlashCommandBuilder()
  .setName("embedcompra2")
  .setDescription("Crear embed de compra avanzado"),
new SlashCommandBuilder()
  .setName("clean")
  .setDescription("Borrar mensajes")
  .addIntegerOption(option =>
    option
      .setName("cantidad")
      .setDescription("Cantidad de mensajes a borrar")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100)
  ),
new SlashCommandBuilder()
  .setName("verifypanel")
  .setDescription("Enviar panel de verificación"),

  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Enviar el panel principal de 012 Shop"),

new SlashCommandBuilder()
  .setName("embedcompra")
  .setDescription("Crear un embed personalizado de compra"),

new SlashCommandBuilder()
  .setName("carrito")
  .setDescription("Ver tu carrito de compras")
 ].map(command => command.toJSON());
  client.once("clientReady", async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands }
  );

  console.log("✅ Comando /panel registrado");
});

client.on("interactionCreate", async interaction => {

  if (interaction.isChatInputCommand()) {
if (interaction.commandName === "clean") {

  if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
    return interaction.reply({
      content: "❌ No tenés permisos.",
      ephemeral: true
    });
  }

  const cantidad = interaction.options.getInteger("cantidad");

  await interaction.channel.bulkDelete(cantidad, true);

  await interaction.reply({
    content: `✅ Se borraron ${cantidad} mensajes.`,
    ephemeral: true
  });

}
if (interaction.commandName === "carrito") {
  const carritoUsuario = carritos.get(interaction.user.id) || [];

  if (carritoUsuario.length === 0) {
    return interaction.reply({
      content: "🛒 Tu carrito está vacío.",
      ephemeral: true
    });
  }

  const listaProductos = carritoUsuario
    .map((producto, index) => `**${index + 1}.** ${producto.titulo}`)
    .join("\n");

  const carritoEmbed = new EmbedBuilder()
    .setTitle("🛒 Tu Carrito")
    .setDescription(
      "Estos son los productos que agregaste:\n\n" +
      listaProductos
    )
    .setColor("#8A2BE2")
    .setFooter({ text: "012 Shop • Carrito de compras" })
    .setTimestamp();

  const botonesCarrito = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("finalizar_compra")
      .setLabel("Finalizar compra")
      .setEmoji("✅")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("quitar_producto")
      .setLabel("Quitar producto")
      .setEmoji("🗑️")
      .setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({
    embeds: [carritoEmbed],
    components: [botonesCarrito],
    ephemeral: true
  });
}
if (interaction.commandName === "embedcompra") {

  const modal = new ModalBuilder()
    .setCustomId("modal_embed_compra")
    .setTitle("Crear Embed de Compra");

  const tituloInput = new TextInputBuilder()
    .setCustomId("embed_titulo")
    .setLabel("Título")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Ej: Pack Premium 012 Shop")
    .setRequired(true);

  const descripcionInput = new TextInputBuilder()
    .setCustomId("embed_descripcion")
    .setLabel("Descripción")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Escribí la descripción del producto...")
    .setRequired(true);

  const bannerInput = new TextInputBuilder()
    .setCustomId("embed_banner")
    .setLabel("Banner URL")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Imagen grande abajo del texto")
    .setRequired(false);

  const imagenInput = new TextInputBuilder()
    .setCustomId("embed_imagen")
    .setLabel("Imagen URL")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Imagen chica arriba a la derecha")
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(tituloInput),
    new ActionRowBuilder().addComponents(descripcionInput),
    new ActionRowBuilder().addComponents(bannerInput),
    new ActionRowBuilder().addComponents(imagenInput)
  );

  await interaction.showModal(modal);
}
if (interaction.commandName === "embedcompra2") {

  const modal = new ModalBuilder()
    .setCustomId("modal_embed_compra_2")
    .setTitle("Embed Compra Avanzado");

  const tituloInput = new TextInputBuilder()
    .setCustomId("embed2_titulo")
    .setLabel("Título del producto")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Ej: Fortnite Accounts")
    .setRequired(true);

  const descripcionInput = new TextInputBuilder()
    .setCustomId("embed2_descripcion")
    .setLabel("Descripción completa")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Texto español / inglés / detalles")
    .setRequired(true);

  const preciosInput = new TextInputBuilder()
    .setCustomId("embed2_precios")
    .setLabel("Precios múltiples")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("1-20 Skins - 2.999 Ars - 2 USD\n20-50 Skins - 3.499 Ars - 3 USD")
    .setRequired(true);

  const extraInput = new TextInputBuilder()
    .setCustomId("embed2_extra")
    .setLabel("Categoría | Stock | Emoji")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Fortnite | Stock inmediato | 🛒")
    .setRequired(false);

  const imagenInput = new TextInputBuilder()
    .setCustomId("embed2_imagen")
    .setLabel("Imagen URL")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("URL de imagen")
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(tituloInput),
    new ActionRowBuilder().addComponents(descripcionInput),
    new ActionRowBuilder().addComponents(preciosInput),
    new ActionRowBuilder().addComponents(extraInput),
    new ActionRowBuilder().addComponents(imagenInput)
  );

  await interaction.showModal(modal);
}
if (interaction.commandName === "verifypanel") {

  const embed = new EmbedBuilder()
    .setColor("#006bff")
    .setTitle("🛡️ 012 SHOP • VERIFICACIÓN")
    .setDescription(`
# Verifica tu cuenta de Discord

Accedé al servidor de forma segura utilizando nuestro sistema de verificación avanzado.

### 🔒 Protección anti-bots
### ⚡ Acceso rápido y automático
### 👥 Desbloqueo completo del servidor

Presioná el botón de abajo para continuar.
    `)
    .setFooter({
      text: "012 Shop • Sistema seguro"
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Verificarme")
      .setStyle(ButtonStyle.Link)
      .setEmoji("💬")
      .setURL("https://zero12-shop-bot.onrender.com")
       );
await interaction.channel.send({
  embeds: [embed],
  components: [row]
});

await interaction.reply({
  content: "✅ Panel de verificación enviado correctamente.",
  ephemeral: true
});
}
if (interaction.commandName === "panel") {

  const embed = new EmbedBuilder()
    .setAuthor({
      name: "012 Shop",
      iconURL: interaction.guild.iconURL()
    })
    .setTitle("Tickets System")
    .setDescription(
      "🇪🇸 **¡Hola!** Para abrir un ticket, debes presionar uno de los siguientes botones.\n\n" +
      "🇺🇸 **Hello!** To open a ticket, you must press one of the following buttons.\n\n" +
      "🛒 **Compra:** Abrí un ticket para realizar una compra.\n" +
      "🛠️ **Soporte:** Recibí ayuda de nuestro staff.\n" +
      "⭐ **Vouches:** Dejá tu review de la tienda.\n\n" +
      "© 012 Shop • Todos los derechos reservados."
    )
    .setColor("#2B2D31")
    .setFooter({
      text: "012 Shop • Sistema oficial"
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("comprar")
      .setLabel("Compra")
      .setEmoji("🛒")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("soporte")
      .setLabel("Soporte")
      .setEmoji("🛠️")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("pagos")
      .setLabel("Pagos")
      .setEmoji("💳")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("vouches")
      .setLabel("Vouches")
      .setEmoji("⭐")
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.reply({
    embeds: [embed],
    components: [row]
  });
}
  if (interaction.customId?.startsWith("agregar_carrito_")) {
  const productoId = interaction.customId.replace("agregar_carrito_", "");
 const producto = {
  titulo: decodeURIComponent(productoId)
};
  const carritoUsuario = carritos.get(interaction.user.id) || [];

  carritoUsuario.push(producto);
  carritos.set(interaction.user.id, carritoUsuario);

  await interaction.reply({
    content: `✅ Producto **${producto.titulo}** agregado con éxito a tu carrito.`,
    ephemeral: true
  });
}
if (interaction.customId === "finalizar_compra") {

  const carritoUsuario = carritos.get(interaction.user.id) || [];

  if (carritoUsuario.length === 0) {
    return interaction.reply({
      content: "❌ Tu carrito está vacío.",
      ephemeral: true
    });
  }

  const productosTexto = carritoUsuario
    .map((producto, index) => `**${index + 1}.** ${producto.titulo}`)
    .join("\n");

  const canal = await interaction.guild.channels.create({
    name: `carrito-${interaction.user.username}`,
    type: 0,
    parent: TICKET_CATEGORY_ID,

    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: ["ViewChannel"]
      },
      {
        id: interaction.user.id,
        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
      },
      {
        id: STAFF_ROLE_ID,
        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
      }
    ]
  });

 const embedCarrito = new EmbedBuilder()
  .setAuthor({
    name: "012 Shop • Sistema de Compras"
  })
  .setTitle("🛒 Nueva Compra desde Carrito")
  .setDescription(
    `Hola ${interaction.user}, gracias por comprar en **012 Shop**.\n\n` +

    "📦 **Productos seleccionados:**\n\n" +
    `${productosTexto}\n\n` +

    "📝 **Información importante:**\n" +
    "• Esperá a que un staff reclame tu ticket.\n" +
    "• No envíes dinero sin confirmación.\n" +
    "• Podés enviar capturas o referencias dentro del ticket.\n\n" +

    "💳 **Métodos de pago disponibles:**\n" +
    "• Mercado Pago\n" +
    "• Transferencia\n" +
    "• Ualá\n" +
    "• Crypto\n\n" +

    "👤 Un encargado te atenderá lo antes posible.\n\n" +

    "⭐ Gracias por confiar en 012 Shop."
  )
  .setThumbnail(interaction.guild.iconURL())
  .setColor("#8A2BE2")
  .setFooter({
    text: "012 Shop • Sistema Oficial de Tickets"
  })
  .setTimestamp();
  const ticketButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("cerrar_ticket")
      .setLabel("Cerrar Ticket")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("reclamar_ticket")
      .setLabel("Reclamar Ticket")
      .setEmoji("🙋")
      .setStyle(ButtonStyle.Primary)
  );

  await canal.send({
    content: `<@&${STAFF_ROLE_ID}>`,
    embeds: [embedCarrito],
    components: [ticketButtons]
  });

  carritos.delete(interaction.user.id);

  await interaction.reply({
    content: `✅ Compra enviada correctamente: ${canal}`,
    ephemeral: true
  });
}
if (interaction.customId === "quitar_producto") {
  const carritoUsuario = carritos.get(interaction.user.id) || [];

  if (carritoUsuario.length === 0) {
    return interaction.reply({
      content: "🛒 Tu carrito está vacío.",
      ephemeral: true
    });
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId("seleccionar_quitar_producto")
    .setPlaceholder("Seleccioná el producto que querés quitar")
    .addOptions(
      carritoUsuario.map((producto, index) => ({
        label: producto.titulo.slice(0, 100),
        description: "Quitar este producto del carrito",
        value: String(index)
      }))
    );

  const row = new ActionRowBuilder().addComponents(menu);

  await interaction.reply({
    content: "🗑️ Seleccioná el producto que querés quitar de tu carrito:",
    components: [row],
    ephemeral: true
  });
}
if (interaction.isStringSelectMenu()) {
  if (interaction.customId === "seleccionar_quitar_producto") {
    const carritoUsuario = carritos.get(interaction.user.id) || [];
    const index = Number(interaction.values[0]);

    if (!carritoUsuario[index]) {
      return interaction.reply({
        content: "❌ Ese producto ya no existe en tu carrito.",
        ephemeral: true
      });
    }

    const productoQuitado = carritoUsuario.splice(index, 1)[0];
    carritos.set(interaction.user.id, carritoUsuario);

    await interaction.reply({
      content: `✅ Producto **${productoQuitado.titulo}** quitado correctamente de tu carrito.`,
      ephemeral: true
    });
  }
}
 if (interaction.customId === "comprar") {

  const canal = await interaction.guild.channels.create({
    name: `compra-${interaction.user.username}`,
    type: 0,
    parent: TICKET_CATEGORY_ID,

    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: ["ViewChannel"]
      },
      {
        id: interaction.user.id,
        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
      },
      {
        id: STAFF_ROLE_ID,
        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
      }
    ]
  });

 const embedTicket = new EmbedBuilder()
  .setAuthor({
    name: "012 Shop • Sistema de Compras"
  })
  .setTitle("🛒 Ticket de Compra")
  .setDescription(
    `Hola ${interaction.user}, bienvenido a **012 Shop**.\n\n` +

    "📦 Tu ticket de compra fue creado correctamente.\n\n" +

    "📝 **Para agilizar la atención, enviá la siguiente información:**\n\n" +

    "• Producto o servicio que querés comprar\n" +
    "• Cantidad\n" +
    "• Método de pago\n" +
    "• Capturas o referencias si es necesario\n\n" +

    "💳 **Métodos de pago disponibles:**\n" +
    "• Mercado Pago\n" +
    "• Transferencia\n" +
    "• Ualá\n" +
    "• Crypto\n\n" +

    "⚠️ **Importante:**\n" +
    "No realices ningún pago hasta que un miembro del staff confirme disponibilidad y datos oficiales.\n\n" +

    "👤 Un encargado tomará tu ticket en breve.\n\n" +

    "⭐ Gracias por confiar en 012 Shop."
  )
  .setColor("#8A2BE2")
  .setThumbnail(interaction.guild.iconURL())
  .setFooter({
    text: "012 Shop • Sistema Oficial de Tickets"
  })
  .setTimestamp();
const ticketButtons = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("cerrar_ticket")
    .setLabel("Cerrar Ticket")
    .setEmoji("🔒")
    .setStyle(ButtonStyle.Danger),

  new ButtonBuilder()
    .setCustomId("reclamar_ticket")
    .setLabel("Reclamar Ticket")
    .setEmoji("🙋")
    .setStyle(ButtonStyle.Primary)
);

await canal.send({
  content: `<@&${STAFF_ROLE_ID}>`,
  embeds: [embedTicket],
  components: [ticketButtons]
});
  await interaction.reply({
    content: `✅ Ticket creado: ${canal}`,
    ephemeral: true
  });
}
if (interaction.customId === "soporte") {

  const canal = await interaction.guild.channels.create({
    name: `soporte-${interaction.user.username}`,
    type: 0,
    parent: TICKET_CATEGORY_ID,

    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: ["ViewChannel"]
      },
      {
        id: interaction.user.id,
        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
      },
      {
        id: STAFF_ROLE_ID,
        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
      }
    ]
  });

  const embedSoporte = new EmbedBuilder()
    .setAuthor({ name: "012 Shop • Soporte Oficial" })
    .setTitle("🆘 Ticket de Soporte")
    .setDescription(
      `Hola ${interaction.user}, bienvenido al soporte de **012 Shop**.\n\n` +
      "📌 Para ayudarte más rápido, explicá tu problema con la mayor cantidad de detalles posible.\n\n" +
      "Podés incluir:\n" +
      "• Qué problema tenés\n" +
      "• Capturas o pruebas\n" +
      "• Producto o servicio relacionado\n" +
      "• Método de pago usado, si corresponde\n\n" +
      "👤 Un miembro del staff tomará tu ticket en breve."
    )
    .setColor("#8A2BE2")
    .setFooter({ text: "012 Shop • Sistema de Soporte" })
    .setTimestamp();

  const ticketButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("cerrar_ticket")
      .setLabel("Cerrar Ticket")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("reclamar_ticket")
      .setLabel("Reclamar Ticket")
      .setEmoji("🙋")
      .setStyle(ButtonStyle.Primary)
  );

  await canal.send({
    content: `<@&${STAFF_ROLE_ID}>`,
    embeds: [embedSoporte],
    components: [ticketButtons]
  });

  await interaction.reply({
    content: `✅ Ticket de soporte creado: ${canal}`,
    ephemeral: true
  });
}    
  if (interaction.customId === "pagos") {

  const pagosEmbed = new EmbedBuilder()
    .setAuthor({ name: "012 Shop • Métodos de Pago" })
    .setTitle("💳 Información de Pagos")
    .setDescription(
      "Estos son los métodos de pago disponibles en **012 Shop**.\n\n" +

      "🇦🇷 **Argentina**\n" +
      "• Mercado Pago\n" +
      "• Transferencia bancaria\n" +
      "• Ualá\n\n" +

      "🌎 **Internacional**\n" +
      "• Crypto\n" +
      "• Binance Pay\n\n" +

      "📌 **Importante:**\n" +
      "Antes de enviar el dinero, abrí un ticket de compra y esperá que un staff confirme disponibilidad.\n\n" +

      "🧾 **Luego de pagar:**\n" +
      "Enviá comprobante dentro del ticket para validar tu compra.\n\n" +

      "⚠️ **No nos hacemos responsables por pagos enviados sin confirmar stock o datos con el staff.**"
    )
    .setColor("#8A2BE2")
    .setFooter({ text: "012 Shop • Pagos seguros" })
    .setTimestamp();

  const pagosButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("comprar")
      .setLabel("Abrir compra")
      .setEmoji("🛍️")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("soporte")
      .setLabel("Necesito ayuda")
      .setEmoji("🆘")
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.reply({
    embeds: [pagosEmbed],
    components: [pagosButtons],
    ephemeral: true
  });
}
if (interaction.customId === "vouches") {

  const modal = new ModalBuilder()
    .setCustomId("modal_vouch")
    .setTitle("Dejar Review");

  const reviewInput = new TextInputBuilder()
    .setCustomId("review_texto")
    .setLabel("Escribí tu review")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Contanos tu experiencia con 012 Shop...")
    .setRequired(true);

  const row = new ActionRowBuilder().addComponents(reviewInput);

  modal.addComponents(row);

  await interaction.showModal(modal);
}
  if (interaction.customId === "cerrar_ticket") {

  const modal = new ModalBuilder()
    .setCustomId("modal_cerrar_ticket")
    .setTitle("Cerrar Ticket");

  const razonInput = new TextInputBuilder()
    .setCustomId("razon_cierre")
    .setLabel("Razón del cierre")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Escribí la razón...")
    .setRequired(true);

  const row = new ActionRowBuilder().addComponents(razonInput);

  modal.addComponents(row);

  await interaction.showModal(modal);
}
if (interaction.customId === "reclamar_ticket") {

  if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
    return interaction.reply({
      content: "❌ No tenés permiso para reclamar tickets.",
      ephemeral: true
    });
  }

  await interaction.channel.setName(
    `reclamado-${interaction.user.username}`
  );

  const reclamarEmbed = new EmbedBuilder()
    .setTitle("🙋 Ticket Reclamado")
    .setDescription(
      `El ticket fue reclamado por ${interaction.user}`
    )
    .setColor("#8A2BE2")
    .setFooter({ text: "012 Shop • Sistema de Tickets" });

  await interaction.reply({
    embeds: [reclamarEmbed]
  });
}
if (interaction.isModalSubmit()) {
if (interaction.customId === "modal_embed_compra_2") {

  const titulo = interaction.fields.getTextInputValue("embed2_titulo");
  const descripcion = interaction.fields.getTextInputValue("embed2_descripcion");
  const precios = interaction.fields.getTextInputValue("embed2_precios");
  const extra = interaction.fields.getTextInputValue("embed2_extra") || "General | Stock disponible | 🛒";
  const imagen = interaction.fields.getTextInputValue("embed2_imagen");

  const [categoria, stock, emoji] = extra.split("|").map(x => x?.trim());

  const productoId = encodeURIComponent(titulo);

  const embedCompra2 = new EmbedBuilder()
    .setAuthor({ name: "012 Shop • Producto Oficial" })
    .setTitle(titulo)
    .setDescription(
      descripcion +
      "\n\n" +
      `**📦 Categoría:** ${categoria || "General"}\n` +
      `**✅ Stock:** ${stock || "Disponible"}\n\n` +
      "**💸 Precio | Prices**\n" +
      "```yaml\n" +
      precios +
      "\n```"
    )
    .setColor("#8A2BE2")
    .setFooter({ text: "012 Shop • Compra segura" })
    .setTimestamp();

  const imagenLimpia = limpiarUrl(imagen);

  if (imagenLimpia) {
    embedCompra2.setThumbnail(imagenLimpia);
  }

  const botonesCompra2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Ir a comprar")
      .setEmoji("🛒")
      .setStyle(ButtonStyle.Link)
      .setURL("https://discord.com/channels/" + interaction.guild.id + "/1507133572270788638"),

    new ButtonBuilder()
      .setCustomId(`agregar_carrito_${productoId}`)
      .setLabel("Agregar al carrito")
      .setEmoji(emoji || "🛍️")
      .setStyle(ButtonStyle.Success)
  );

  await interaction.channel.send({
    embeds: [embedCompra2],
    components: [botonesCompra2]
  });

  await interaction.reply({
    content: "✅ Embed de compra avanzado enviado correctamente.",
    ephemeral: true
  });
}
if (interaction.customId === "modal_embed_compra") {

  const titulo = interaction.fields.getTextInputValue("embed_titulo");
  const descripcion = interaction.fields.getTextInputValue("embed_descripcion");
  const banner = interaction.fields.getTextInputValue("embed_banner");
  const imagen = interaction.fields.getTextInputValue("embed_imagen");

  const embedCompra = new EmbedBuilder()
    .setAuthor({ name: "012 Shop • Producto Oficial" })
    .setTitle(titulo)
    .setDescription(descripcion)
    .setColor("#8A2BE2")
    .setFooter({ text: "012 Shop • Compra segura" })
    .setTimestamp();

const imagenLimpia = limpiarUrl(imagen);
const bannerLimpio = limpiarUrl(banner);

if (imagenLimpia) {
  embedCompra.setThumbnail(imagenLimpia);
}

if (bannerLimpio) {
  embedCompra.setImage(bannerLimpio);
}

const productoId = encodeURIComponent(titulo);

const botonesCompra = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setLabel("Ir a comprar")
    .setEmoji("🛒")
    .setStyle(ButtonStyle.Link)
    .setURL("https://discord.com/channels/" + interaction.guild.id + "/1507133572270788638"),

  new ButtonBuilder()
    .setCustomId(`agregar_carrito_${productoId}`)
    .setLabel("Agregar al carrito")
    .setEmoji("🛍️")
    .setStyle(ButtonStyle.Success)
);
  await interaction.channel.send({
  embeds: [embedCompra],
  components: [botonesCompra]
});
await interaction.reply({
  content: "✅ Embed de compra enviado correctamente.",
  ephemeral: true
});
}
if (interaction.customId === "modal_vouch") {

  const textoReview =
    interaction.fields.getTextInputValue("review_texto");

  const canalVouches =
    interaction.guild.channels.cache.get(VOUCHES_CHANNEL_ID);

  const reviewEmbed = new EmbedBuilder()
    .setAuthor({
      name: `${interaction.user.username} • Nuevo Vouch`,
      iconURL: interaction.user.displayAvatarURL()
    })
    .setTitle("⭐ Nueva Review")
    .setDescription(
      `💬 **Opinión del cliente:**\n\n${textoReview}\n\n` +
      "🛍️ Gracias por confiar en **012 Shop**."
    )
    .setThumbnail(interaction.guild.iconURL())
    .setColor("#8A2BE2")
    .setFooter({
      text: "012 Shop • Reviews Oficiales"
    })
    .setTimestamp();

  await canalVouches.send({
    embeds: [reviewEmbed]
  });

  await interaction.reply({
    content: "✅ Tu review fue enviada correctamente.",
    ephemeral: true
  });
}

  if (interaction.customId === "modal_cerrar_ticket") {

    const razon = interaction.fields.getTextInputValue("razon_cierre");

    await interaction.reply({
      content: "🔒 Cerrando ticket y generando transcript ...",
      ephemeral: true
    });

    const transcript = await discordTranscripts.createTranscript(
      interaction.channel,
      {
        limit: -1,
        filename: `transcript-${interaction.channel.name}.html`
      }
    );

    const canalLogs = interaction.guild.channels.cache.get(LOG_CIERRES_ID);

    const embedLogs = new EmbedBuilder()
      .setTitle("🔒 Ticket Cerrado")
      .setColor("#8A2BE2")
      .addFields(
        {
          name: "👤 Staff",
          value: `${interaction.user}`,
          inline: true
        },
        {
          name: "📄 Razón",
          value: razon,
          inline: false
        },
        {
          name: "🎫 Ticket",
          value: interaction.channel.name,
          inline: true
        }
      )
      .setTimestamp();

    await canalLogs.send({
      embeds: [embedLogs],
      files: [transcript]
    });

   const dmEmbed = new EmbedBuilder()
  .setAuthor({
    name: "012 Shop • Sistema de Soporte"
  })
  .setTitle("📩 Tu ticket fue cerrado")
  .setDescription(
    `Hola ${interaction.user},\n\n` +

    "Gracias por haberte contactado con el soporte oficial de **012 Shop**.\n\n" +

    `🔒 Tu ticket \`${interaction.channel.name}\` fue cerrado correctamente.\n\n` +

    `👤 **Staff encargado:**\n${interaction.user}\n\n` +

    `📝 **Razón del cierre:**\n${razon}\n\n` +

    "📂 Adjuntamos el transcript completo del ticket para que puedas conservar toda la conversación.\n\n" +

    "⭐ Tu opinión es muy importante para nosotros.\n" +
    "Por favor calificá la atención recibida usando los botones de abajo."
  )
  .setColor("#8A2BE2")
  .setThumbnail(interaction.guild.iconURL())
  .setFooter({
    text: "012 Shop • Gracias por confiar en nosotros"
  })
  .setTimestamp();
    const botonesCalificacion = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("calificacion_mala")
        .setLabel("Mala")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("calificacion_buena")
        .setLabel("Buena")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("calificacion_excelente")
        .setLabel("Excelente")
        .setStyle(ButtonStyle.Success)
    );

    try {
      await interaction.user.send({
        embeds: [dmEmbed],
        files: [transcript],
        components: [botonesCalificacion]
      });
    } catch (err) {
      console.log("DM cerrados");
    }

    setTimeout(() => {
      interaction.channel.delete();
    }, 5000);
  }
}

if (
  interaction.customId === "calificacion_mala" ||
  interaction.customId === "calificacion_buena" ||
  interaction.customId === "calificacion_excelente"
) {

  const canalCalificaciones =
    interaction.client.channels.cache.get(LOG_CALIFICACIONES_ID);

  let texto = "Mala";

  if (interaction.customId === "calificacion_buena") {
    texto = "Buena";
  }
if (interaction.customId === "calificacion_excelente") {

  const canal = interaction.guild.channels.cache.get(VOUCH_CHANNEL_ID);

  if (!canal) {
    return interaction.reply({
      content: "❌ Canal de vouches no encontrado.",
      ephemeral: true
    });
  }

  const mensaje = `
⭐ **Nueva calificación excelente**

👤 Usuario: ${interaction.user}

📝 Opinión:
Excelente servicio, muy recomendado.
`;

  await canal.send({
    content: mensaje
  });

  await interaction.reply({
    content: "✅ Gracias por tu calificación.",
    ephemeral: true
  });
}
)
client.login(process.env.TOKEN);