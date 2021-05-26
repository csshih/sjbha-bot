import { env, Handler, registerHandler } from '@sjbha/app';
import { command, startsWith } from '@sjbha/utils/command';
import { DateTime } from 'luxon';

const festivize = (msg: string) => `🎄☃️☃️🎄🎁 ${msg} 🎁🎄☃️☃️🎄`;
const pluralize = (word: string, count: number) => word + (count === 1 ? '' : 'S');

const christmas : Handler = message => {
  const now = DateTime
    .local ()
    .setZone (env.TIME_ZONE)
    .set ({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  const xmas = DateTime
    .local ()
    .setZone (env.TIME_ZONE)
    .set ({
      month: 12, day: 25,
      hour: 0, minute: 0, second: 0, millisecond: 0
    });

  let diff = xmas.diff (now, "days");

  // If it's already passed xmas, use next year's christmas
  if (diff.days < 0) {
    diff = xmas
      .set ({ year: now.year + 1 })
      .diff (now, "days");
  }

  const daysLeft = Math.floor (diff.days);

  const reply = (daysLeft === 0) 
    ? festivize (`!!TODAY IS CHRISTMAS!!`)
    : festivize (`ONLY ${daysLeft} ${pluralize("DAY", daysLeft)} UNTIL CHRISTMAS!!`);

  message.channel.send (reply);
};

registerHandler (
  command (
    startsWith ("!christmas"),
    christmas
  )
);