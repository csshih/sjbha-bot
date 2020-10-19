import type { DiscordMember } from "@services/bastion";
import type { UserProfile } from "../../domain/user/User";
import type { SummaryDetails, SummaryStats } from "../../domain/strava/ActivitySummary";
import type Activity from "../../domain/strava/Activity";

import * as R from "ramda";
import format from 'string-format';
import {MessageOptions} from "discord.js";

import {toTenths, toRelative} from "./conversions";
import {GenderedEmoji, getEmoji} from "./emoji";
import { asField, field } from "./embed";
import { sortByProp } from "@plugins/fit/fp-utils";

interface ProfileData {
  member: DiscordMember, 
  user: UserProfile,
  activities: SummaryDetails  
}

/** Takes a number, and if large shortens it to "1.4k" etc */
const shortened = (num: number) => {
  if (num < 1000) return Math.floor(num);
  return (num/1000).toFixed(1) + "k"; // todo: expand this when close to.... one million lol 
}

const level = ({user}: ProfileData) => field("Level", user.level);
const exp = ({user}: ProfileData) => field("EXP", shortened(user.exp));

const fitScore = ({user}: ProfileData) => R.pipe(() => 
  format(
    '{0} *({1})*',
    toTenths(user.fitScore.score),
    user.fitScore.rankName
  ),
  asField("Fit Score")
)();

/** Show the last activity's title, otherwise let user know it's empty */
const recent = ({user, activities}: ProfileData) => R.pipe(
  R.ifElse(
    activity => !activity,
    R.always("*No activities in last 30 days*"),
    activityLog(getEmoji(user.gender))
  ),
  asField(`Last Activity`, false)
)(activities.lastActivity)

const activityLog = (emoji: GenderedEmoji) => (activity: Activity) => format(
  '{0} {1} {2}',
    emoji(activity.type),
    activity.name,
    toRelative(activity.timestamp)
  )

/** Display totals of each workout type, along with count + time */
const totals = ({activities}: ProfileData) => R.pipe(
  sortByProp<SummaryStats>("count"),
  R.map(totalSummary),
  R.join("\n"),
  asField(`30 Day Totals *(${activities.count} Activities)*`)
)(activities.stats)

const totalSummary = (summary: SummaryStats) => format(
  '**{0}** • {1} activities ({2})',
    summary.type,
    summary.count.toString(),
    summary.totalTime.toString()
  )

export const createProfileEmbed = (data: ProfileData): MessageOptions["embed"] => ({
  color: 0x4ba7d1,

  author: {
    name: data.member.displayName,
    icon_url: data.member.avatar
  },

  fields: [level, exp, fitScore, recent, totals]
    .map(R.applyTo(data))
})