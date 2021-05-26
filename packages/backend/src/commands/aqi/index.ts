import { channels, registerHandler, Handler } from '@sjbha/app';
import {command, restrictToChannel, startsWith} from '@sjbha/utils/command';

import * as Config from './src/config';
import * as PurpleAir from './src/purpleair';

import { description, embed, title, color, footer} from "@sjbha/utils/embed";

const aqi : Handler = async message => {
  const sensors = await PurpleAir.SensorCollection.fetchIds (Config.sensorIds);
  const aqi = sensors.getAverageAqi ();

  const borderColor =
    (aqi < 50) ? 5564977
    : (aqi < 100) ? 16644115
    : (aqi < 150) ? 16354326
    : 13309719;

  const locations = Config.locations.map (name => {
    const ids = Config.sensorsByLocation (name);
    const aqi = sensors.filter (ids).getAverageAqi ();

    const emoji =
      (aqi < 50) ? "🟢"
      : (aqi < 100) ? "🟡"
      : (aqi < 150) ? "🟠"
      : "🔴";

    return `${emoji} **${name}** ${aqi}`;
  });

  const reply = embed (
    title(`Air quality Index • ${aqi} average`),
    color (borderColor),
    description (locations.join("\n")),
    footer("Based on a 10 minute average from Purple Air sensors")
  );

  message.channel.send (reply);
}

registerHandler (
  command (
    startsWith ('!aqi'),
    restrictToChannel (channels.shitpost, "AQI command is limited to #shitpost"),
    aqi
  )
);