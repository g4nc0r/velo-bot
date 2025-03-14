import { DISCORD_ACCESS_TOKEN, DISCORD_ENABLED, TELEGRAM_ENABLED, TWITTER_ENABLED } from './secrets'
import { DiscordClient } from './clients/discordClient'
import { Client } from 'discord.js'
import RpcClient from './clients/client'
import { TwitterApi } from 'twitter-api-v2'
import { Context, Telegraf } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { defaultActivity } from './integrations/discord'
import { TwitterClient } from './clients/twitterClient'
import { TelegramClient } from './clients/telegramClient'
import { GetPrices } from './integrations/coingecko'
import { TrackEvents } from './event/blockEvent'
import { PricingJob } from './schedule'
import { optimismInfuraProvider } from './clients/ethersClient'

let discordClient: Client<boolean>
let twitterClient: TwitterApi
let telegramClient: Telegraf<Context<Update>>

export async function goBot() {
  const rpcClient = new RpcClient(optimismInfuraProvider)
  await SetUpDiscord()
  await SetUpTwitter()
  //await SetUpTelegram()

  global.ENS = {}
  global.TOKEN_PRICES = {}
  global.TOKEN_IMAGES = {}

  await GetPrices()
  await TrackEvents(discordClient, telegramClient, twitterClient, rpcClient)
  PricingJob()
}

export async function SetUpDiscord() {
  if (DISCORD_ENABLED) {
    discordClient = DiscordClient
    discordClient.on('ready', async (client) => {
      console.debug('Discord Bot is online!')
    })
    await discordClient.login(DISCORD_ACCESS_TOKEN)
    defaultActivity(discordClient)
  }
}

export async function SetUpTwitter() {
  if (TWITTER_ENABLED) {
    twitterClient = TwitterClient
    twitterClient.readWrite
  }
}

export async function SetUpTelegram() {
  if (TELEGRAM_ENABLED) {
    telegramClient = TelegramClient
  }
}
