import { MessageEmbed } from "discord.js";
import { DiscordMember } from "@services/bastion";

import ActivityEmoji from "./ActivityEmoji";

import ExperiencePoints from "../../domain/user/ExperiencePoints";
import Activity from "../../domain/strava/Activity";
import { UserProfile } from "../../domain/user/User";

interface CreateProps {
  member: DiscordMember;
  user: UserProfile;
  exp: ExperiencePoints;
  activity: Activity;
}

export function createActivityEmbed({member, user, exp, activity}: CreateProps) {
  const nickname = member.member.displayName;
  let embed = new MessageEmbed().setColor("FC4C02");
  
  embed.setTitle(activity.name);
  embed.setDescription(activity.description || "");

  embed.setThumbnail(member.avatar);
  embed.setFooter(`Gained ${exp.total} experience points (${exp.moderateRounded}+ ${exp.vigorousRounded}++)`);
  embed.addField("Time", activity.elapsedTime.hhmmss, true);

  const emoji = new ActivityEmoji(activity.type, user.gender);

  // Fill out activity-specific fields
  switch (activity.type) {

  case "Ride": {
    embed.setAuthor(`${emoji.toString()} ${nickname} just went for a ride`);
    embed.addField("Distance", activity.distance.toMiles.toFixed(2) + "mi", true);
    embed.addField("Elevation", Math.floor(activity.elevation.toFeet) + "ft", true);

    break;
  }

  case "Run": {
    embed.setAuthor(`${emoji.toString()} ${nickname} just went for a run`);
    embed.addField("Distance", activity.distance.toMiles.toFixed(2) + "mi", true);
    embed.addField("Pace", activity.speed.toPace.hhmmss + "m/mi", true);

    break;
  }

  case "Yoga": {
    embed.setAuthor(`${emoji.toString()} ${nickname} just did some yoga`);
    break;
  }

  case "Crossfit": {
    embed.setAuthor(`${emoji.toString()} ${nickname} just did crossfit`);
    activity.avgHeartrate && 
      embed.addField("Avg HR", Math.round(activity.avgHeartrate), true);

    activity.maxHeartrate &&
      embed.addField("Max HR", Math.round(activity.maxHeartrate), true);    

    break;
  }

  case "Hike": {
    embed.setAuthor(`${emoji.toString()} ${nickname} just did a hike`);
    embed.addField("Distance", activity.distance.toMiles.toFixed(2) + "mi", true);
    embed.addField("Elevation", Math.floor(activity.elevation.toFeet) + "ft", true);

    break;
  }

  case "Walk": {
    embed.setAuthor(`${emoji.toString()} ${nickname} just went for a walk`);
    embed.addField("Distance", activity.distance.toMiles.toFixed(2) + "mi", true);

    break;
  }

  default: {
    embed.setAuthor(`${emoji.toString()} ${nickname} just did a workout`);
    activity.avgHeartrate && 
      embed.addField("Avg HR", Math.round(activity.avgHeartrate), true);

    activity.maxHeartrate &&
      embed.addField("Max HR", Math.round(activity.maxHeartrate), true);    

    break;
  }

  }

  return embed;
}