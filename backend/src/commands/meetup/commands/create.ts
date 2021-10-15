import { Message } from 'discord.js';
import { nanoid } from 'nanoid';
import YAML from 'yaml';
import { DateTime } from 'luxon';

import * as db from '../db/meetups';
import * as M from '../common/Meetup';
import { render } from '../features/render';
import { validateOptions, ValidationError } from '../common/validateOptions';


/**
 * Creates a new meetup
 */
export async function create (message: Message) : Promise<void> {
  // Guard for guild channels, lets us create threads
  if (message.channel.type !== 'GUILD_TEXT')
    return;

  const inputText = message.content.replace ('!meetup create', '');
  const messageOptions = (() : unknown | undefined => {
    try { return YAML.parse (inputText); }
    catch (e) { return undefined; }
  }) ();

  if (!messageOptions) {
    message.reply ('Hm couldn\'t understand the options -- Make sure you\'re copy and pasting the whole command correctly.');
    return;
  }

  const options = validateOptions (messageOptions);
  
  if (options instanceof ValidationError) {
    message.reply (options.error);
    return;
  }

  const thread = await message.channel.threads.create ({
    name:   M.threadTitle (options.title, options.date),
    reason: 'Meetup discussion thread',
    
    autoArchiveDuration: 1440,
  });

  const meetup : db.Meetup = {
    id:              nanoid (),
    organizerID:     message.author.id,
    title:           options.title,
    sourceChannelID: message.channel.id,
    threadID:        thread.id,
    announcementID:  '',
    createdAt:       DateTime.local ().toISO (),
    // todo: verify date format 
    timestamp:       options.date,
    description:     options.description || '',
    links:           options.links ?? [],
    rsvps:           [],
    maybes:          [],
    location:        M.location (options),
    state:           { type: 'Live' }
  };

  const post = await render (meetup);

  await Promise.all ([
    db.insert ({ 
      ...meetup,
      announcementID: post.id
    }),
    message.delete ()
  ]);
}